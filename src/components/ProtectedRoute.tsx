import { Component, JSX } from 'solid-js';
import { Navigate } from '@solidjs/router';

interface ProtectedRouteProps {
  password: () => string;
  children: JSX.Element;
}

const ProtectedRoute: Component<ProtectedRouteProps> = (props) => {
  return (
    <>
      {props.password() && !props.password().match(/[^a-zA-Z0-9]/) ? (
        props.children
      ) : (
        <Navigate href="/" />
      )}
    </>
  );
};

export default ProtectedRoute;