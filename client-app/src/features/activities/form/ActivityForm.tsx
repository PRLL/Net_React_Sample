import React, { ChangeEvent, useState } from 'react';
import { Button, Form, Segment } from 'semantic-ui-react';
import { Activity } from '../../../models/activity';

interface Props {
    activity: Activity | undefined;
    submitting: boolean;
    closeForm: () => void;
    createOrEdit: (activity: Activity) => void;
}
  
export default function ActivityForm({ activity: selectedActivity /*using ':' changes the name of variable*/, submitting,
    closeForm, createOrEdit }: Props) {
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
        createOrEdit(formActivity);
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
                <Form.Input type='date' placeholder='Date' value={ formActivity.date.split('T')[0] } name='date' onChange={ handleInputChange } />
                <Form.Input placeholder='City' value={ formActivity.city } name='city' onChange={ handleInputChange } />
                <Form.Input placeholder='Venue' value={ formActivity.venue } name='venue' onChange={ handleInputChange } />
                <Button loading={submitting} floated='right' positive type='submit' content='Submit' />
                <Button onClick={ closeForm } floated='right' type='button' content='Cancel' />
            </Form>
        </Segment>
    );
}