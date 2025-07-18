# Project Name
typescript_planner - Financial Planner Web Application

# Project Description
The Financial Planner App is used to manage personal finances, track expenses, set budgets, and set reminders for related events or deadlines.
Users can input income and expenses, track event dates with notifications and reminders, and add notes securely.

# Setup Guide Financial Planner App

Before you begin, make sure you have the following installed:

- **Node.js** (Download from [nodejs.org](https://nodejs.org))
- **Git** (Download from [git-scm.com](https://git-scm.com))
- **Any code editor with version control** (Recommended: [VS Code](https://code.visualstudio.com))

Also, make sure you have accepted the invitation to join the repo through the e-mail link.

## **Project Setup**

Follow these steps to get the project running on your computer.

### **Clone the Repository**

Open a terminal (or Git Bash) and run:

```bash
cd ~/your-folder  # Navigate to a folder where you want the project
```

Then clone the repository:

```bash
git clone https://github.com/FranklinUniversityCompSciPracticum/SP25_Hotel.git
```

### **Navigate to the Project Folder**

```bash
cd SP25_Hotel
```

### **Install Dependencies**

Run the following command to install everything the project needs using npm:

```bash
npm install
```

### **Start the Development Server**

Run:

```bash
npm run dev
```

This should open the project in your default browser at `http://localhost:5173`.
You should see a terminal notification like this:
![Running Server ->](image.png)


With the server running, the HomePage for the app will be shown at `http://localhost:5173`.

The HomePage should look something like this at first setup:

![alt text](image-1.png)



If you can see something like the above picture, your app is running on the server and you are good to go.

## Troubleshooting

### **1. "Command Not Found" Errors**

If `git` or `npm` is not recognized, make sure:

- You installed **Git** and **Node.js** correctly.
- You restarted your terminal after installation.

The commands: [git -v] and [node -v] can be ran in your terminal to check installation.
If the command returns A value it is installed correctly (11.x.x, v22.x.x)


### **2. "Port 5173 is Already in Use"**

- Close any previous Vite instances or restart your computer.
- Run: `npm run dev -- --port 3000` to use a different port (in this case port 3000).

Test that the server is running with this command in another terminal:

(USE THE PORT IT SHOWS IN YOUR TERMINAL IF NOT THE DEFAULT 5173)
netstat -ano | findstr :5173 

If nothing is returned in the terminal, the server is not running on the selected port. 

### **3. "Module Not Found" Errors**

- Run: `npm install` to reinstall dependencies.
- If issues persist, these commands will re-install the dependencies for the project:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

##   **Project Structure Overview**

```
SP25_Hotel/
│-- public/             # Static assets
│-- src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Different screens (Login, Dashboard, etc.)
│   ├── services/       # API calls (Firebase)
│   ├── styles/         # CSS files
│   ├── App.tsx         # Main app component
│   └── main.tsx        # React entry point
│-- package.json        # Project dependencies
│-- vite.config.ts      # Vite configuration
```


