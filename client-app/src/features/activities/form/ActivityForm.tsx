import { observer } from 'mobx-react-lite';
import { ChangeEvent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Button, Form, Segment } from 'semantic-ui-react';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { useStore } from '../../../app/stores/store';
import { v4 as uuid } from 'uuid';
  
export default observer(function ActivityForm() {
    const history = useHistory();
    const { activityStore } = useStore();
    const {id} = useParams<{id: string}>();

    const [formActivity, setActivity] = useState({
        id: '',
        title: '',
        description: '',
        category: '',
        date: '',
        city: '',
        venue: ''
    });

    useEffect(() => {
        if (id) activityStore.loadActivity(id).then(activity => setActivity(activity!));
    }, [id, activityStore])

    function handleSubmit() {
        if (formActivity.id.length === 0) {
            formActivity.id = uuid();
            // let newActivity = {
            //     ...formActivity,
            //     id: uuid()
            // };

            activityStore.create(formActivity).then(() => {
                history.push(`/activities/${formActivity.id}`);
            })
        } else {
            activityStore.update(formActivity).then(() => {
                history.push(`/activities/${formActivity.id}`);
            });
        }
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = event.target;
        setActivity({ ...formActivity, [name]: value })
    }

    if (activityStore.loadingInitial) return <LoadingComponent content='Loading Activity...' />

    return (
        <Segment clearing>
            <Form onSubmit={ handleSubmit } autoComplete='off'>
                <Form.Input placeholder='Title' value={ formActivity.title } name='title' onChange={ handleInputChange } />
                <Form.TextArea placeholder='Description' value={ formActivity.description } name='description' onChange={ handleInputChange } />
                <Form.Input placeholder='Category' value={ formActivity.category } name='category' onChange={ handleInputChange } />
                <Form.Input type='date' placeholder='Date' value={ formActivity.date } name='date' onChange={ handleInputChange } />
                <Form.Input placeholder='City' value={ formActivity.city } name='city' onChange={ handleInputChange } />
                <Form.Input placeholder='Venue' value={ formActivity.venue } name='venue' onChange={ handleInputChange } />
                <Button loading={ activityStore.loading } floated='right' positive type='submit' content='Submit' />
                <Button as={ Link } to='/activities' floated='right' type='button' content='Cancel' />
            </Form>
        </Segment>
    );
})