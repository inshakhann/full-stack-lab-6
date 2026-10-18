// Lab 6 - async/await and Promise.all (JavaScript only, run with: node lab6.js)
// Needs Node 18+ (built-in fetch) and an internet connection.

const BASE_URL = 'https://jsonplaceholder.typicode.com';

// ---------------------------------------------------------------
// Task 1: async/await function that returns a valid user object,
//         or throws an error when fetching fails.
// ---------------------------------------------------------------
async function fetchUser(id) {
  const response = await fetch(`${BASE_URL}/users/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch user ${id}: HTTP ${response.status}`);
  }

  const user = await response.json();

  // A successful response must still contain a valid user object.
  if (!user || typeof user.id !== 'number' || !user.name || !user.email) {
    throw new Error(`Invalid user data received for id ${id}`);
  }
  return user;
}

// ---------------------------------------------------------------
// Task 2: Promise.all over two async operations. The main promise
//         is accepted only if BOTH results are valid, else rejected.
// ---------------------------------------------------------------
async function fetchPosts(userId) {
  const response = await fetch(`${BASE_URL}/posts?userId=${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch posts for user ${userId}: HTTP ${response.status}`);
  }
  return response.json();
}

function isValidUser(user) {
  return Boolean(user) && typeof user.id === 'number' && Boolean(user.name) && Boolean(user.email);
}

function isValidPosts(posts) {
  return Array.isArray(posts) && posts.length > 0 && posts.every((p) => p.userId !== undefined && p.title);
}

function fetchUserWithPosts(id) {
  return new Promise((resolve, reject) => {
    Promise.all([fetchUser(id), fetchPosts(id)])
      .then(([user, posts]) => {
        if (!isValidUser(user)) {
          reject(new Error('User details are not valid'));
        } else if (!isValidPosts(posts)) {
          reject(new Error('Post details are not valid'));
        } else {
          resolve({ user, posts });
        }
      })
      .catch((error) => {
        // Promise.all rejects as soon as either operation fails.
        reject(error);
      });
  });
}

// ---------------------------------------------------------------
// Demonstration
// ---------------------------------------------------------------
async function main() {
  console.log('--- Task 1 ---');
  try {
    const user = await fetchUser(1);
    console.log('Success:', user.id, user.name, user.email);
  } catch (error) {
    console.log('Error:', error.message);
  }

  try {
    await fetchUser(9999); // does not exist -> 404
  } catch (error) {
    console.log('Error (expected):', error.message);
  }

  console.log('\n--- Task 2 ---');
  try {
    const { user, posts } = await fetchUserWithPosts(1);
    console.log(`Accepted: ${user.name} has ${posts.length} posts`);
  } catch (error) {
    console.log('Rejected:', error.message);
  }

  try {
    await fetchUserWithPosts(9999);
  } catch (error) {
    console.log('Rejected (expected):', error.message);
  }
}

main();
