import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import ActivityDetailedChat from "./ActivityDetailedChat";
import ActivityDetailedHeader from "./ActivityDetailedHeader";
import ActivityDetailedInfo from "./ActivityDetailedInfo";
import ActivityDetailedSidebar from "./ActivityDetailedSidebar";

export default observer(function ActivityDetails() {
  const { t } = useTranslation();

  const { activityStore } = useStore();
  const { selectedActivity: activity } = activityStore;
  const { id } = useParams<{id: string}>();

  const [width, setWidth] = useState<number>(window.innerWidth);
  function handleWindowSizeChange() {
      setWidth(window.innerWidth);
  }
  useEffect(() => {
      window.addEventListener('resize', handleWindowSizeChange);
      return () => {
          window.removeEventListener('resize', handleWindowSizeChange);
      }
  }, []);
  
  let isMobile: boolean = (width <= 768);

  useEffect(() => {
    if (id) activityStore.detail(id);
    return () => activityStore.setSelectedActivity(undefined);
  }, [id, activityStore]);

  if (activityStore.loadingInitial || !activity) return <LoadingComponent content={ t('fetching_activity') } />;

  return (
    <Grid>
      <Grid.Column width={ isMobile ? '16' : '10' }>
        <ActivityDetailedHeader activity={ activity }/>
        <ActivityDetailedInfo  activity={ activity }/>
        <ActivityDetailedChat activityId={ activity.id } />
      </Grid.Column>
      {
        !isMobile && (
          <Grid.Column width='6'>
            <ActivityDetailedSidebar activity={ activity }/>
          </Grid.Column>
        )
      }
    </Grid>
  );
})