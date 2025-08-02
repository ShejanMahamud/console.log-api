## 📌 Project Overview

Console.Log - A portal for developer - where users can post blogs, tech news, tech topics, tech suggestions, upvote/downvote, reply to post, reply to user.

## 🎯 Goals & Objectives

The goal was to create a forum/platform only for developer. That will help to develop networking, help each other with valuable knowledge, post new tech news/blogs.

## 🛠️ Tech Stack

- Frontend: NextJS
- Backend: NestJS, PostgreSQL, Prisma, BullMQ, JWT

## 🚀 Features

- ...
- ...

## 🧱 Challenges Faced

1. Buffer serialization problem with BullMQ: Binary data got corrupted during file uploads.

## 🧠 How I Overcame Them

1. Discovered BullMQ doesn’t handle Buffer well, so I converted it to base64 before queueing and decoded it in the processor

## 📚 Key Learnings

- ...
- ...

## 📷 Screenshots / Diagrams

(Optional)

## 🚧 Future Improvements

- ...

## ✅ Conclusion

A quick wrap-up...
