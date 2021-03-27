import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Button, Header, Segment } from 'semantic-ui-react';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { useStore } from '../../../app/stores/store';
import { v4 as uuid } from 'uuid';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextInput from '../../../app/common/form/TextInput';
import TextArea from '../../../app/common/form/TextArea';
import SelectInput from '../../../app/common/form/SelectInput';
import { categoryOptions } from '../../../app/common/select_options/categoryOptions';
import DateInput from '../../../app/common/form/DateInput';
import { ActivityFormValues } from '../../../app/models/activity';
  
export default observer(function ActivityForm() {
    const history = useHistory();
    const { activityStore } = useStore();
    const { id } = useParams<{ id: string }>();

    const [formActivity, setActivity] = useState<ActivityFormValues>(new ActivityFormValues());

    const validationSchema = Yup.object({
        title: Yup.string().required('The activity title is required'),
        description: Yup.string().required('The activity description is required'),
        category: Yup.string().required('The activity category is required'),
        date: Yup.string().required('The activity date is required'),
        venue: Yup.string().required('The activity venue is required'),
        city: Yup.string().required('The activity category is required')
    })

    useEffect(() => {
        if (id) activityStore.detail(id).then(activity => setActivity(new ActivityFormValues(activity)));
    }, [id, activityStore])

    function handleFormSubmit(formActivity: ActivityFormValues) {
        if (!formActivity.id) {
            formActivity.id = uuid();

            activityStore.create(formActivity).then(() => {
                history.push(`/activities/${formActivity.id}`);
            })
        } else {
            activityStore.update(formActivity).then(() => {
                history.push(`/activities/${formActivity.id}`);
            });
        }
    }

    if (activityStore.loadingInitial) return <LoadingComponent content='Loading Activity...' />

    return (
        <Segment clearing>
            <Header content='Activity Details' sub color='teal' />
            <Formik enableReinitialize
                initialValues={ formActivity }
                validationSchema={ validationSchema }
                onSubmit={ values => handleFormSubmit(values) }
            >
                {({ handleSubmit, isValid, isSubmitting, dirty }) => (
                    <Form className='ui form' onSubmit={ handleSubmit } autoComplete='off'>
                        {/* <FormTextInput>
                            <TextInput placeholder='Title' name='title' />
                            <ErrorMessage name='title' render={ error => <Label basic color='red' content={ error } /> } />
                        </FormTextInput> */}

                        <TextInput placeholder='Title' name='title' />
                        <TextArea rows={ 3 } placeholder='Description' name='description' />
                        <SelectInput options={ categoryOptions } placeholder='Category' name='category' />
                        <DateInput placeholderText='Date' name='date' showTimeSelect timeCaption='time' dateFormat='MMMM d, yyyy h:mm aa' />

                        <Header content='Location Details' sub color='teal' />
                        <TextInput placeholder='City' name='city' />
                        <TextInput placeholder='Venue' name='venue' />

                        <Button 
                            disabled={ isSubmitting || !dirty || !isValid }
                            loading={ isSubmitting } 
                            floated='right' positive type='submit' content='Submit'
                        />
                        <Button as={ Link } to='/activities' floated='right' type='button' content='Cancel' />
                    </Form>
                )}
            </Formik>

        </Segment>
    );
})