import { ErrorMessage, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Button, Header, Label } from "semantic-ui-react";
import TextInput from "../../app/common/form/TextInput";
import { useStore } from "../../app/stores/store";

export default observer(function LoginForm() {
    const { t } = useTranslation();
  
    const { userStore } = useStore();

    return (
        <Formik
            initialValues={ {email: '', password: '', error: null} }
            onSubmit={ (values, { setErrors }) => userStore.login(values).catch(error => setErrors({ error: t('invalid_credentials') })) }
        >
            {
                ({ handleSubmit, isSubmitting, errors }) => (
                    <Form className='ui form' onSubmit={ handleSubmit } autoComplete='off'>
                        <Header as='h2' content={ t('login') } color='teal' textAlign='center' />
                        <TextInput name='email' placeholder={ t('email') } />
                        <TextInput name='password' placeholder={ t('password') } type='password' />
                        <ErrorMessage name='error' render={ () => <Label style={ {marginBottom: 10} } basic color='red' content={ errors.error }/> }/>
                        <Button loading={ isSubmitting } positive content={ t('login') } type='submit' fluid />
                    </Form>
                )
            }
        </Formik>
    )
})