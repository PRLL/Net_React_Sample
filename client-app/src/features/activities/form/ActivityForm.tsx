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
import { useTranslation } from 'react-i18next';
  
export default observer(function ActivityForm() {
    const { t } = useTranslation();

    const history = useHistory();
    const { activityStore } = useStore();
    const { id } = useParams<{ id: string }>();

    const [formActivity, setActivity] = useState<ActivityFormValues>(new ActivityFormValues());

    const validationSchema = Yup.object({
        title: Yup.string().required(t('activity_title_required')),
        description: Yup.string().required(t('activity_description_required')),
        category: Yup.string().required(t('activity_category_required')),
        date: Yup.string().required(t('activity_date_required')),
        venue: Yup.string().required(t('activity_venue_required')),
        city: Yup.string().required(t('activity_city_required'))
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

    if (activityStore.loadingInitial) return <LoadingComponent content={ t('loading_activity') } />

    return (
        <Segment clearing>
            <Header content={ t('activity_details') } sub color='teal' />
            <Formik enableReinitialize
                initialValues={ formActivity }
                validationSchema={ validationSchema }
                onSubmit={ values => handleFormSubmit(values) }
            >
                {
                    ({ handleSubmit, isValid, isSubmitting, dirty }) => (
                        <Form className='ui form' onSubmit={ handleSubmit } autoComplete='off'>
                            <TextInput placeholder={ t('title') } name='title' />
                            <TextArea rows={ 3 } placeholder={ t('description') } name='description' />
                            <SelectInput options={ categoryOptions } placeholder={ t('category') } name='category' />
                            <DateInput placeholderText={ t('date') } name='date' showTimeSelect timeCaption='time' dateFormat='MMMM d, yyyy h:mm aa' />

                            <Header content={ t('location_details') } sub color='teal' />
                            <TextInput placeholder={ t('city') } name='city' />
                            <TextInput placeholder={ t('venue') } name='venue' />

                            <Button 
                                disabled={ isSubmitting || !dirty || !isValid }
                                loading={ isSubmitting } 
                                floated='right' positive type='submit' content={ t('submit') }
                            />
                            <Button as={ Link } to='/activities' floated='right' type='button' content={ t('cancel') } />
                        </Form>)
                }
            </Formik>

        </Segment>
    );
})