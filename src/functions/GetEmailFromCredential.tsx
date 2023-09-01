import jwt_decode, { JwtPayload } from "jwt-decode";

const getEmailFromCredential = (credential: string) => {
    const decoded: any = jwt_decode(credential);
    const email = decoded.email;
    return email;
}

export { getEmailFromCredential };