import axios from "axios";
import { store } from "../../store";

const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL
    : "http://localhost:5000";

export interface LostPetFormData {
  name: string;
  kind: string;
  location: string;
  image: File | null;
  status: "Lost";
  color?: string;
  description: string;
  userId: string;
  coordinates: { type: 'Point', coordinates: [number, number] } | null;
}

export interface SpotPetFormData {
  name: string;
  kind: string;
  location: string;
  image: File | null;
  status: "Found";
  color?: string;
  description: string;
  userId: string;
  coordinates: { type: 'Point', coordinates: [number, number] } | null;
}

const uploadImage = async (image: File) => {
  const formData = new FormData();
  formData.append("file", image);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const submitLostPet = async (formData: LostPetFormData) => {
  const requestFormData = new FormData();
  requestFormData.append("name", formData.name);
  requestFormData.append("kind", formData.kind);
  requestFormData.append("status", formData.status);
  requestFormData.append("description", formData.description);
  requestFormData.append("color", formData.color || "");
  requestFormData.append("location", formData.location);
  requestFormData.append("userId", formData.userId);
  
  if (formData.coordinates) {
    requestFormData.append("lat", formData.coordinates.coordinates[1].toString());
    requestFormData.append("lng", formData.coordinates.coordinates[0].toString());
  }

  if (formData.image) {
    requestFormData.append("image", formData.image);
  }
  console.log("[submitLostPet]--coordinates", formData.coordinates);
  const response = await axios.post(
    //     // BEFORE:
    // `${API_URL}/api/pets/add/${formData.userId}`  // userId was in URL

    // AFTER: userId now sent in form data
    `${API_URL}/api/pets/add`, // Changed: Simplified endpoint
    requestFormData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const submitFoundPet = async (formData: SpotPetFormData) => {
  try {
    // Get current user from Redux store
    const currentUser = store.getState().user.currentUser;
    console.log("[submitFoundPet]--currentUser", currentUser);

    if (!currentUser?._id) {
      throw new Error("Please sign in to report a found pet");
    }

    const requestFormData = new FormData();
    requestFormData.append("name", formData.name);
    requestFormData.append("kind", formData.kind);
    requestFormData.append("status", formData.status);
    requestFormData.append("description", formData.description);
    requestFormData.append("color", formData.color || "");
    requestFormData.append("location", formData.location);
    requestFormData.append("userId", currentUser._id); // Use currentUser._id instead of localStorage

    if (formData.image) {
      requestFormData.append("image", formData.image);
    }

    const response = await axios.post(
      `${API_URL}/api/pets/add`,
      requestFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to submit found pet report"
      );
    }
    throw error;
  }
};
