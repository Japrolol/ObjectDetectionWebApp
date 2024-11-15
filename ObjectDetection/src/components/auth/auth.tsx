import axios from 'axios';

const Register = async (username: string, email: string, password: string) => {
    const data = {
        username: username,
        email: email,
        password: password
    }
    await axios.post(import.meta.env.VITE_API_URL+"/register", data).then((response): Promise<void> => {
        console.log(response);
        return Promise.resolve();
    }).catch((error) => {
        console.log(error);
        return Promise.reject();
    });
}
const UpdateMaxBoxes = async (max_boxes: number): Promise<void> => {
    const data = {
        max_boxes: max_boxes
    }
    await axios.post(import.meta.env.VITE_API_URL+"/update_max_boxes", data, {withCredentials: true}).then((response) => {
        if (response.status === 200){
            console.log("Max boxes updated");
            return Promise.resolve();
        }
    }).catch((error) => {
        console.log(error);
        return Promise.reject();
    });
}

const Login = async (username: string, password: string): Promise<void> => {
    const data = {
        username: username,
        password: password
    }
    await axios.post(import.meta.env.VITE_API_URL+"/login", data, {withCredentials: true}).then((response) => {
        if (response.status === 200){
            console.log("Logged in");
            return Promise.resolve();
        }
    }).catch((error) => {
        console.log(error);
        return Promise.reject();
    });
}
const Logout = async (): Promise<void> => {
    await axios.post(import.meta.env.VITE_API_URL+"/logout", {}, {withCredentials: true}).then((response) => {
        if (response.status === 200){
            console.log("Logged out");
            return Promise.resolve();
        }
    }).catch((error) => {
        console.log(error);
        return Promise.reject();
    });
}
const CheckAuthenticated = async (): Promise<boolean> => {
    try {
        const response = await axios.get(import.meta.env.VITE_API_URL + `/protected`, { withCredentials: true });
        return response.status === 200;

    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401){
            return false;
        }
        return false;
    }
};

export default {CheckAuthenticated, Login, Register, Logout, UpdateMaxBoxes};