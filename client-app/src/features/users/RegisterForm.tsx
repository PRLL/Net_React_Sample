import { ErrorMessage, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { Button, Header } from "semantic-ui-react";
import TextInput from "../../app/common/form/TextInput";
import { useStore } from "../../app/stores/store";
import * as Yup from 'yup';
import ValidationErrors from "../errors/ValidationErrors";
import { useTranslation } from "react-i18next";

export default observer(function RegisterForm() {
    const { t } = useTranslation();
  
    const { userStore } = useStore();

    return (
        <Formik initialValues={ {displayName: '', username: '', email: '', password: '', error: null} } 
            onSubmit={ (values, { setErrors }) => userStore.register(values).catch(error => setErrors({ error })) }
            validationSchema={
                Yup.object({
                    displayName: Yup.string().required(t('display_name_required')),
                    username: Yup.string().required(t('username_required')),
                    email: Yup.string().required(t('email_required')).email(),
                    password: Yup.string().required(t('password_required'))
                }) 
            }
        >
            {
                ({ handleSubmit, isSubmitting, errors, isValid, dirty }) => (
                    <Form className='ui form error' onSubmit={ handleSubmit } autoComplete='off'>
                        <Header as='h2' content={ t('sign_up') } color='teal' textAlign='center' />
                        <TextInput name='displayName' placeholder={ t('display_name') } />
                        <TextInput name='username' placeholder={ t('user_name') } />
                        <TextInput name='email' placeholder={ t('email') } />
                        <TextInput name='password' placeholder={ t('password') } type='password' />
                        <ErrorMessage name='error' render={ () => <ValidationErrors errors={ errors.error } /> }/>
                        <Button disabled={ !isValid || !dirty || isSubmitting }
                            loading={ isSubmitting }
                            positive content={ t('register') } type='submit' fluid
                        />
                    </Form>)
            }
        </Formik>
    )
})