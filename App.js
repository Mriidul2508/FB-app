import React, { useState, useEffect } from 'react';
import FacebookLogin from 'react-facebook-login';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [pageInsights, setPageInsights] = useState({});

  const responseFacebook = (response) => {
    console.log(response);
    setIsLoggedIn(true);
    setUserData(response);
    getFacebookPages(response.userID);
  };

  const getFacebookPages = async (userId) => {
    try {
      const response = await axios.get(`https://graph.facebook.com/${userId}/accounts?access_token=${userData.accessToken}`);
      const pagesData = response.data.data;
      setPages(pagesData);
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const handlePageChange = (event) => {
    setSelectedPage(event.target.value);
  };

  const fetchPageInsights = async (pageId) => {
    try {
      const response = await axios.get(`https://graph.facebook.com/${pageId}/insights/page_fans,page_engagement,page_impressions,page_reactions?period=total_over_range&access_token=${userData.accessToken}`);
      setPageInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  useEffect(() => {
    if (selectedPage) {
      fetchPageInsights(selectedPage);
    }
  }, [selectedPage]);

  return (
    <div className="App">
      {!isLoggedIn && (
        <FacebookLogin
          appId="345894788383067"
          autoLoad={true}
          fields="name,email,picture"
          callback={responseFacebook}
        />
      )}
      {isLoggedIn && (
        <div>
          <h1>Welcome, {userData.name}!</h1>
          <img src={userData.picture.data.url} alt="Profile Picture" />
          <h2>Select a Page:</h2>
          <select value={selectedPage} onChange={handlePageChange}>
            <option value="">Select a page</option>
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.name}
              </option>
            ))}
          </select>
          {selectedPage && (
            <div>
              <h2>Page Insights:</h2>
              <div>
                <h3>Fans:</h3>
                {pageInsights.data && pageInsights.data[0].values && pageInsights.data[0].values[0].value}
              </div>
              <div>
                <h3>Engagement:</h3>
                {pageInsights.data && pageInsights.data[1].values && pageInsights.data[1].values[0].value}
              </div>
              <div>
                <h3>Impressions:</h3>
                {pageInsights.data && pageInsights.data[2].values && pageInsights.data[2].values[0].value}
              </div>
              <div>
                <h3>Reactions:</h3>
                {pageInsights.data && pageInsights.data[3].values && pageInsights.data[3].values[0].value}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
