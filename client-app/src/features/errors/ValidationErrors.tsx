import { Message } from "semantic-ui-react";

interface Props {
    errors: any;
}

export default function ValidationErrors({ errors }: Props) {
    return (
        <Message error>
            {
                errors && (
                    <Message.List>
                        { errors.map((error: any, key: any) => (
                            <Message.Item key={ key }>{ error }</Message.Item>
                        ))}
                    </Message.List>
                )
            }
        </Message>
    )
}