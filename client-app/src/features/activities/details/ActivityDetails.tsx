import React from "react";
import { Button, Card, Image } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
// import { Activity } from "../../../models/activity";

// interface Props {
  // activity: Activity;
  // cancelSelectActivity: () => void;
  // openForm: (id: string) => void;
// }

export default function ActivityList(/*{ activity, cancelSelectActivity, openForm }: Props*/) {
  const { activityStore } = useStore();
  const { selectedActivity } = activityStore;

  if (!selectedActivity) return <LoadingComponent />;

  return (
    <Card fluid>
      <Image src={`/assets/categoryImages/${ selectedActivity.category }.jpg`} />
      <Card.Content>
        <Card.Header>{ selectedActivity.title }</Card.Header>
        <Card.Meta>
          <span>{ selectedActivity.date }</span>
        </Card.Meta>
        <Card.Description>
          { selectedActivity.description }
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
          <Button.Group widths='2'>
              <Button onClick={ () => activityStore.openForm(selectedActivity.id) } basic color='blue' content='Edit' />
              <Button onClick={ activityStore.deselect } basic color='grey' content='Cancel' />
          </Button.Group>
      </Card.Content>
    </Card>
  );
}
