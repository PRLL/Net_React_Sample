import { Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { Button } from "semantic-ui-react";
import TextInput from "../../app/common/form/TextInput";
import TextArea from "../../app/common/form/TextArea";
import { useStore } from "../../app/stores/store";
import * as Yup from 'yup';

interface Props {
    setEditMode: (editMode: boolean) => void;
}

export default observer(function ProfileEditForm({ setEditMode } : Props) {
    const { profileStore } = useStore();
    const { profile } = profileStore;

    return (
        <Formik
            initialValues={ {displayName: profile?.displayName, bio: profile?.bio} }
            onSubmit={ values => {
                profileStore.update(values).then(() => {
                    setEditMode(false);
                })
            } }
            validationSchema={ Yup.object({
                displayName: Yup.string().required()
            }) }
        >
            {
                ({ isSubmitting, isValid, dirty }) => (
                <Form className='ui form'>
                    <TextInput placeholder='Display Name' name='displayName' />
                    <TextArea rows={3} placeholder='Add bio' name='bio' />
                    <Button 
                        positive
                        type='submit'
                        loading={ isSubmitting }
                        content='Update profile'
                        floated='right'
                        disabled={ !isValid || !dirty }
                    />
                </Form>)
            }
        </Formik>
    )
})