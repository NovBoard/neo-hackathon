import { Div } from "./Common";
import { BounceLoader } from "react-spinners";
import '../styles/Spinner.scss';

const Spinner = () => {
    return (
        <Div className="spinner">
            <BounceLoader color="#ffffff" size={150} />
        </Div>
    )
}

export { Spinner };