import { Redirect, Route, RouteComponentProps, RouteProps } from "react-router";
import { useStore } from "../stores/store";

interface Props extends RouteProps {
    component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
}

export default function PrivateRoute({ component: Component, ...routeProps }: Props) {
    const { userStore: { isLoggedIn } } = useStore();

    return (
        <Route
            { ...routeProps }
            render={ (routeComponentProps) => isLoggedIn ? <Component { ...routeComponentProps } /> : <Redirect to='/' /> }
        />
    )
}