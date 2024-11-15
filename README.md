# Object Detection Project

## Object Detection

To run this project, you need to have Python and Node.js installed on your computer.

### 1. Create the Database
- Use the `obj_det.sql` file to create the database.
- A default account with the email `admin@gmail.com`, user `admin` and password `admin123` is already created.
- You can create your own account.

### 2. Create Environment Files
- In the root folder, create a `.env` file with the following fields:
    ```dotenv
    DB_HOST=SERVER NAME
    DB_USER=USERNAME
    DB_PORT=3306
    DB_NAME=YOUR_DB_NAME
    DB_PASSWORD=PASSWORD
    SECRET_KEY=SECRET KEY
    ```
- In the `ObjectDetection` folder, create another `.env` file with the following field:
    ```dotenv
    VITE_API_URL="http://localhost:8000/api"
    ```

### 3. Install Dependencies
- In the terminal, run:
    ```bash
    pip install -r requirements.txt
    ```
- After installing the required modules, navigate to the `ObjectDetection` folder:
    ```bash
    cd ObjectDetection
    ```
- In the `ObjectDetection` folder, run:
    ```bash
    npm install
    ```
- Install the AI Model and put it in the `root` folder
- Download [Here](https://www.kaggle.com/models/google/faster-rcnn-inception-resnet-v2)

### 4. Run the Project
- In the `ObjectDetection` folder, start the development server:
    ```bash
    npm run dev
    ```
- In a new terminal window, in the root folder, run:
    ```bash
    python server.py
    ```

### 5. Access the Application
- Open your browser and go to [http://localhost:5173](http://localhost:5173).
- Log in using the default admin account.
