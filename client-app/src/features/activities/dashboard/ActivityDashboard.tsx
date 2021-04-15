
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Grid, Loader } from 'semantic-ui-react';
import { useStore } from '../../../app/stores/store';
import ActivityList from './ActivityList';
import ActivityFilters from './ActivityFilters';
import { PagingParams } from '../../../app/models/pagination';
import InfiniteScroll from 'react-infinite-scroller';
import ActivityListItemPlaceholder from './ActivityListItemPlaceholder';

export default observer(function ActivityDashboard() {
    const { activityStore } = useStore();
    const { pagination } = activityStore;

    const [loadingNext, setLoadingNext] = useState(false);

    function handleGetNext() {
        setLoadingNext(true);
        activityStore.setPagingParams(new PagingParams(pagination!.currentPage + 1))
        activityStore.list().then(() => setLoadingNext(false));
    }

    useEffect(() => {
        if (activityStore.activities.size <= 1) activityStore.list();
      activityStore.list();
    }, [activityStore])

    // if (activityStore.loadingInitial && !loadingNext) return <LoadingComponent content='Fetching Activities...' />

    return (
        <Grid>
            {/* {console.log("total " + pagination?.totalPages + " current " + pagination?.currentPage)} */}
            <Grid.Column width='10'>
                {
                    activityStore.loadingInitial && !loadingNext
                        ? (
                            <>
                                <ActivityListItemPlaceholder />
                                <ActivityListItemPlaceholder />
                            </>
                        )
                        : (
                            <InfiniteScroll
                                pageStart={ 1 }
                                loadMore={ handleGetNext }
                                hasMore={ !loadingNext && !!pagination && pagination.currentPage < pagination.totalPages }
                                initialLoad={ false }
                            >
                                <ActivityList />
                            </InfiniteScroll>
                        )
                }
            </Grid.Column>
            <Grid.Column width='6'>
                <ActivityFilters />
            </Grid.Column>
            <Grid.Column width='10'>
                <Loader active={ loadingNext } />
            </Grid.Column>
        </Grid>
    )
})