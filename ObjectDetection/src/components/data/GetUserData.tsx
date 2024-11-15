import { useEffect, useState } from "react";
import axios from "axios";

type UserData = {
    username: string;
    id: string;
    email: string;
    account_created: Date;
    access_level: number;
    last_login: Date;
    last_image: {
        filename: string;
        date_uploaded: Date;
        avg_score: number;
        objects_identified: number;
    };
    max_boxes: number;
}

const useGetUserData = () => {
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_API_URL + "/get_user_data", { withCredentials: true });
                setUserData(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);

    return userData;
}

export default useGetUserData;