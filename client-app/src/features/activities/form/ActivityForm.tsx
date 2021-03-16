import { observer } from 'mobx-react-lite';
import React, { ChangeEvent, useState } from 'react';
import { Button, Form, Segment } from 'semantic-ui-react';
import { useStore } from '../../../app/stores/store';
// import { Activity } from '../../../models/activity';

// interface Props {
//     // activity: Activity | undefined;
//     submitting: boolean;
//     // closeForm: () => void;
//     createOrEdit: (activity: Activity) => void;
// }
  
export default observer(function ActivityForm(/*{ submitting, createOrEdit */
    // activity: selectedActivity /*using ':' changes the name of variable*/, closeForm*/ 
    /*}: Props*/) {

    const { activityStore } = useStore();
    const { selectedActivity } = activityStore;

    const initialState = selectedActivity ?? {
        id: '',
        title: '',
        description: '',
        category: '',
        date: '',
        city: '',
        venue: ''
    }

    const [formActivity, setActivity] = useState(initialState);

    function handleSubmit() {
        formActivity.id ? activityStore.update(formActivity) : activityStore.create(formActivity);
        // createOrEdit(formActivity);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = event.target;
        setActivity({ ...formActivity, [name]: value })
    }

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
                <Button onClick={ activityStore.closeForm } floated='right' type='button' content='Cancel' />
            </Form>
        </Segment>
    );
})