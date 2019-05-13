export async function graphql(query) {
  const response = await fetch('/multinet/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query
    }),
  });
  return await response.json();
}
