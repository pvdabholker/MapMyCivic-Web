# MapMyCivic Web - Setup and Usage Guide


## 1. Open the project folder

```bash
cd D:\MapMyCivic -Web
```

---

## 2. Make sure the required tools are installed

Install:

* Node.js and npm
* Python 3.10 or above
* PostgreSQL

Check the installed versions:

```bash
node -v
npm -v
python --version
```

---

# 3. Backend Setup

Open a terminal and navigate to the backend folder.

```bash
cd backend
```

### Create a virtual environment

```bash
python -m venv .venv
```

### Activate it

Windows PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

Windows CMD

```cmd
.venv\Scripts\activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Create Backend .env File

Create a file named **.env** inside the **backend** folder.

Example:

```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/mapmycivic

SECRET_KEY=replace-with-a-long-random-secret-key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

CLOUD_NAME=your-cloudinary-cloud-name
API_KEY=your-cloudinary-api-key
API_SECRET=your-cloudinary-api-secret
```

Replace every placeholder with your own values.

---

## 5. Start the Backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

# 6. Frontend Setup

Open another terminal.

```bash
cd frontend
```

Install packages.

```bash
npm install
```

---

## 7. Create Frontend .env File

Create a file named:

```
.env
```

inside the **frontend** folder.

Example:

```env
VITE_API_URL=http://127.0.0.1:8000
```

If your backend is deployed, replace it with your deployed backend URL.

Example:

```env
VITE_API_URL=https://your-backend-url.com
```

Use it inside your React project as:

```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

---

## 8. Start the Frontend

```bash
npm run dev
```

The application will usually be available at

```
http://localhost:5173
```

---

## 9. Common Issues

### Backend does not start

* Ensure the virtual environment is activated.
* Verify that the `.env` file exists.
* Make sure PostgreSQL is running.
* Check that all dependencies are installed.

### Frontend cannot connect to backend

* Make sure the backend is running.
* Verify that `VITE_API_URL` points to the correct backend.
* Restart the frontend after changing the `.env` file.

### npm install fails

Delete:

```
node_modules
package-lock.json
```

Then run

```bash
npm install
```

again.

---

## 10. Stop the Application

Press

```
Ctrl + C
```

in both terminals to stop the frontend and backend servers.
