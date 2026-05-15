<div align="center">

# ⏱️ Message Scheduler for Vencord

*A powerful user plugin for Vencord that allows you to seamlessly schedule messages to be sent at a future date and time in any Discord channel.*

[![Vencord Plugin](https://img.shields.io/badge/Vencord-Plugin-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://vencord.dev)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-ready-f69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge)](license.md)

</div>

<br />

> [!NOTE]  
> **Message Scheduler** integrates natively into your Discord client via Vencord, giving you complete control over *when* your messages are delivered without needing to rely on external bots.

## ✨ Features

- 📅 **Precision Scheduling:** Set an exact future date and time for any message.
- 🖱️ **Chat Bar UI:** Easy access via a sleek calendar icon directly in the Discord message input bar.
- 📋 **Context Menu Integration:** Right-click the chat box to schedule your currently typed text instantly.
- 💾 **Persistent Storage:** Your scheduled messages are saved locally and survive Discord restarts.
- 🔔 **Native Toasts:** Receive real-time, native Discord notifications when your message is successfully dispatched or if an error occurs.

---

## 🚀 Getting Started

> [!IMPORTANT]  
> This plugin is designed to be compiled directly into the [Vencord ecosystem](https://github.com/Vendicated/Vencord). You must have a local developer setup of Vencord to build and inject user plugins.

### 1. Prerequisites

Before you begin, ensure you have the following installed on your system:
* **[Node.js](https://nodejs.org/)** (LTS version recommended)
* **[pnpm](https://pnpm.io/)** (Install globally via `npm install -g pnpm`)
* A local clone of the **[Vencord Repository](https://github.com/Vendicated/Vencord)**

### 2. Installation

Move or clone this plugin folder directly into your Vencord source directory. The path should look exactly like this:

```text
Vencord/src/userplugins/messageScheduler/
