import { observer } from "mobx-react-lite";
import { useEffect } from "react";
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
  const { selectedActivity: activity } = activityStore;
  const { id } = useParams<{id: string}>();

  useEffect(() => {
    if (id) activityStore.detail(id);
    return () => activityStore.setSelectedActivity(undefined);
  }, [id, activityStore]);

  if (activityStore.loadingInitial || !activity) return <LoadingComponent content='Fetching Activity...' />;

  return (
    <Grid>
      <Grid.Column width='10'>
        <ActivityDetailedHeader activity={ activity }/>
        <ActivityDetailedInfo  activity={ activity }/>
        <ActivityDetailedChat activityId={ activity.id } />
      </Grid.Column>
      <Grid.Column width='6'>
        <ActivityDetailedSidebar activity={ activity }/>
      </Grid.Column>
    </Grid>
  );
})