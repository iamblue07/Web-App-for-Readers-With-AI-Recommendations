import { toast } from 'react-toastify';

const createToast = (message, success) => {
    if (!success) {
        toast.error(message, {
            pauseOnHover: false,
            style: {
                background: "rgba(212, 11, 11, 0.66)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "10px",
                fontWeight: "bold",
            },
        });
    } else {
        toast.success(message, {
            pauseOnHover: false,
            style: {
                background: "rgba(11, 207, 70, 0.66)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "10px",
                fontWeight: "bold",
            },
        });
    }
};

export { createToast };