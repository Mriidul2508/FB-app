import React, { useState } from 'react';
import FacebookLogin from 'react-facebook-login';

function App() {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [insights, setInsights] = useState(null);

  const responseFacebook = (response) => {
    console.log(response);
    setUser(response);
    fetchPages(response.accessToken);
  };

  const fetchPages = async (accessToken) => {
    const res = await fetch(`https://graph.facebook.com/me/accounts?access_token=${accessToken}`);
    const data = await res.json();
    setPages(data.data);
  };

  const fetchInsights = async (pageId) => {
    const res = await fetch(`https://graph.facebook.com/${pageId}/insights?access_token=${user.accessToken}&metric=page_fans,page_engaged_users,page_impressions,page_reactions&since=START_DATE&until=END_DATE&period=total_over_range`);
    const data = await res.json();
    setInsights(data.data);
  };

  return (
    <div>
      {!user ? (
        <FacebookLogin
          appId="YOUR_APP_ID"
          autoLoad={true}
          fields="name,picture"
          callback={responseFacebook}
        />
      ) : (
        <div>
          <h1>Welcome, {user.name}</h1>
          <img src={user.picture.data.url} alt="Profile" />
          <select onChange={(e) => setSelectedPage(e.target.value)}>
            <option value="">Select Page</option>
            {pages.map(page => (
              <option key={page.id} value={page.id}>{page.name}</option>
            ))}
          </select>
          <button onClick={() => fetchInsights(selectedPage)}>Get Insights</button>
          {insights && insights.map(insight => (
            <div key={insight.name}>
              <h3>{insight.title}</h3>
              <p>{insight.values[0].value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
