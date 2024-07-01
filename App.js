import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageInsights, setPageInsights] = useState(null);

  useEffect(() => {
    // Check if the user is logged in
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      setIsLoggedIn(true);
      getUserData(accessToken);
    }
  }, []);

  // Get user data
  const getUserData = async (accessToken) => {
    try {
      const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,picture.type(large)&access_token=${accessToken}`);
      setUser(response.data);
      getPages(accessToken);
    } catch (error) {
      console.error(error);
    }
  };

  // Get user's pages
  const getPages = async (accessToken) => {
    try {
      const response = await axios.get(`https://graph.facebook.com/me/accounts?fields=id,name&access_token=${accessToken}`);
      setPages(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Get page insights
  const getPageInsights = async (pageId, accessToken) => {
    try {
      const response = await axios.get(`https://graph.facebook.com/${pageId}/insights?fields=page_fans,page_engagement,page_impressions,page_total_actions&period=total_over_range&since=2023-01-01&until=2023-02-01&access_token=${accessToken}`);
      setPageInsights(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle login
  const handleLogin = () => {
    // Redirect to Facebook login URL
    window.location.href = 'https://www.facebook.com/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=public_profile,pages_read_user_content,manage_pages&response_type=token';
  };

  // Handle page selection
  const handlePageSelect = async (pageId) => {
    setSelectedPage(pageId);
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      getPageInsights(pageId, accessToken);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setUser(null);
    setPages([]);
    setSelectedPage(null);
    setPageInsights(null);
  };

  // Redirect to Facebook after login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      setIsLoggedIn(true);
      getUserData(accessToken);
      window.history.replaceState({}, document.title, '/'); // Remove access token from URL
    }
  }, []);

  return (
    <div className="container">
      {!isLoggedIn && (
        <div className="login-container">
          <h1>Facebook Login</h1>
          <button onClick={handleLogin}>Login with Facebook</button>
        </div>
      )}
      {isLoggedIn && (
        <div className="app-container">
          <div className="user-info">
            <h2>Welcome, {user ? user.name : ''}</h2>
            <img src={user ? user.picture.data.url : ''} alt="Profile Picture" />
          </div>
          <div className="pages-container">
            <h3>Select a Page</h3>
            <select value={selectedPage} onChange={(e) => handlePageSelect(e.target.value)}>
              <option value="">Select a page</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
          {selectedPage && pageInsights && (
            <div className="insights-container">
              <h3>Page Insights: {pages.find((page) => page.id === selectedPage)?.name}</h3>
              <div className="insight-card">
                <h4>Total Followers: {pageInsights.page_fans.data[0].values[0].value}</h4>
              </div>
              <div className="insight-card">
                <h4>Total Engagement: {pageInsights.page_engagement.data[0].values[0].value}</h4>
              </div>
              <div className="insight-card">
                <h4>Total Impressions: {pageInsights.page_impressions.data[0].values[0].value}</h4>
              </div>
              <div className="insight-card">
                <h4>Total Actions: {pageInsights.page_total_actions.data[0].values[0].value}</h4>
              </div>
            </div>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
