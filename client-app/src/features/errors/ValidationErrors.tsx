import { Message } from "semantic-ui-react";

interface Props {
    errors: string[] | null;
}

export default function ValidationErrors({ errors }: Props) {
    return (
        <Message error>
            { errors && (
                <Message.List>
                    { errors.map((error: any, key) => (
                        <Message.Item key={ key }>{ error }</Message.Item>
                    ))}
                </Message.List>
            )}
        </Message>
    )
}