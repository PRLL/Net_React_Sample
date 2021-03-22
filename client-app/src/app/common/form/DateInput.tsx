import { useField } from "formik";
import { Form, Label } from "semantic-ui-react";
import DatePicker, { ReactDatePickerProps } from 'react-datepicker';

                                        /* by using 'Partial<>' all of the properties in the props are optional.
                                        This was used because giving error because not pasing 'onChange' property on 'ActivityForm',
                                        but it is already established inside the 'DatePicker' here... */
export default function DateInput(props: Partial<ReactDatePickerProps>) {
    const [field, meta, helpers] = useField(props.name!);

    return (
        <Form.Field error={ meta.touched && !!meta.error }>
            <DatePicker
                { ...field }
                { ...props }
                selected={ (field.value && new Date(field.value)) || null }
                onChange={ value => helpers.setValue(value) }
            />
            {
                meta.touched && meta.error
                ? (<Label basic color='red'>{ meta.error }</Label>)
                : null
            }
        </Form.Field>
    )
}