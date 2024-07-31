export async function createUser(userId: string) {
  const userCheckResponse = await fetch(
    `${process.env.CIRCLE_API_URL}/users/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
      },
    },
  );
  if (!userCheckResponse.ok) {
    const userCreateResponse = await fetch(
      `${process.env.CIRCLE_API_URL}/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
        },
        body: JSON.stringify({ userId }),
      },
    );
    if (!userCreateResponse.ok) {
      throw new Error("Failed to create user");
    }
  }
}

export async function getUserTokenAndEncryptionKey(userId: string) {
  const tokenResponse = await fetch(
    `${process.env.CIRCLE_API_URL}/users/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
      },
      body: JSON.stringify({ userId }),
    },
  );

  if (!tokenResponse.ok) {
    throw new Error("Failed to fetch user token");
  }

  const { data } = await tokenResponse.json();
  return data;
}
