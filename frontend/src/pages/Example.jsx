import React, { useEffect, useState } from 'react';

function Example() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error('Error fetching API:', err));
  }, []);

  return (
    <div>
      <h1>Message from Laravel API:</h1>
      <p>{message}</p>
    </div>
  );
}

export default Example;