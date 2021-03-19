import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import ActivityDetailedChat from "./ActivityDetailedChat";
import ActivityDetailedHeader from "./ActivityDetailedHeader";
import ActivityDetailedInfo from "./ActivityDetailedInfo";
import ActivityDetailedSidebar from "./ActivityDetailedSidebar";

export default observer(function ActivityDetails() {
  const { activityStore } = useStore();
  // const { selectedActivity } = activityStore;
  const { id } = useParams<{id: string}>();

  const [selectedActivity, setActivity] = useState({
    id: '',
    title: '',
    description: '',
    category: '',
    date: '',
    city: '',
    venue: ''
  });

  useEffect(() => {
    if (id) activityStore.detail(id).then(activity => setActivity(activity!));
  }, [id, activityStore]);

  if (activityStore.loadingInitial || !selectedActivity) return <LoadingComponent />;

  return (
    <Grid>
      <Grid.Column width='10'>
        <ActivityDetailedHeader activity={ selectedActivity }/>
        <ActivityDetailedInfo  activity={ selectedActivity }/>
        <ActivityDetailedChat />
      </Grid.Column>
      <Grid.Column width='6'>
        <ActivityDetailedSidebar />
      </Grid.Column>
    </Grid>

    // <Card fluid>
    //   <Image src={`/assets/categoryImages/${ selectedActivity.category }.jpg`} />
    //   <Card.Content>
    //     <Card.Header>{ selectedActivity.title }</Card.Header>
    //     <Card.Meta>
    //       <span>{ selectedActivity.date }</span>
    //     </Card.Meta>
    //     <Card.Description>
    //       { selectedActivity.description }
    //     </Card.Description>
    //   </Card.Content>
    //   <Card.Content extra>
    //       <Button.Group widths='2'>
    //           <Button as={ Link } to={ `/edit/${selectedActivity.id}` } basic color='blue' content='Edit' />
    //           <Button as={ Link } to='/activities' basic color='grey' content='Cancel' />
    //       </Button.Group>
    //   </Card.Content>
    // </Card>
  );
})