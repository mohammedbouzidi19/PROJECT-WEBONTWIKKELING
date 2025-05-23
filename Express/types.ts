import { ObjectId } from "mongodb";

export interface UserModel {
    _id?: string;
    username: string;
    email: string;
    password: string;
    image?: string;
}
export type Team = {
 
  id?: string;
  name: string;
  foundedYear?: number;
  conference?: "Eastern" | "Western";
  championships?: number;
  imageUrl?: string;
};

export type Arena = {
  id?: string;
  name: string;
  location?: string;
  capacity?: number;
  openedYear?: number;
  imageUrl?: string;
};

export interface FlashMessage {
    type: "error" | "success"
    message: string;
}