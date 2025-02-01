import { NextResponse } from "next/server";

// Mock user database (replace with your actual database or authentication logic)
const users = [{ email: "tuongtran@liontech.vn", password: "tuongtran@liontech.vn" }];
const response = {
  jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzM4MzMyNzE1LCJleHAiOjE3NDA5MjQ3MTV9.YoyDbzJqcUuC2eRGUyQpASH0Sz1kyl1tYi3fF39ttpo",
  user: {
    id: 1,
    documentId: "qngoqf50a7yafxlvgaw6pob5",
    username: "tuongtran@liontech.vn",
    email: "tuongtran@liontech.vn",
    provider: "local",
    confirmed: false,
    blocked: false,
    createdAt: "2024-12-31T09:27:22.635Z",
    updatedAt: "2025-01-31T08:46:45.825Z",
    publishedAt: "2025-01-23T16:17:32.017Z",
    crm_custom_permission: null,
    display_name: "Restricted User",
  },
};
export async function POST(request) {
  const { email, password } = await request.json();
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    const token = response.jwt;
    const userData = response.user;
    return NextResponse.json({ token, userData }, { status: 200 });
  } else {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }
}
