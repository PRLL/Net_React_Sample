
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Divider, Grid, Loader } from 'semantic-ui-react';
import { useStore } from '../../../app/stores/store';
import ActivityList from './ActivityList';
import ActivityFilters from './ActivityFilters';
import { PagingParams } from '../../../app/models/pagination';
import InfiniteScroll from 'react-infinite-scroller';
import ActivityListItemPlaceholder from './ActivityListItemPlaceholder';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default observer(function ActivityDashboard() {
    const { t } = useTranslation();

    const { activityStore } = useStore();
    const { pagination } = activityStore;

    const [loadingNext, setLoadingNext] = useState(false);

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

    function handleGetNext() {
        setLoadingNext(true);
        activityStore.setPagingParams(new PagingParams(pagination!.currentPage + 1))
        activityStore.list().then(() => setLoadingNext(false));
    }

    useEffect(() => {
        if (activityStore.activities.size <= 1) activityStore.list();
      activityStore.list();
    }, [activityStore])

    return (
        <>
            {
                isMobile && (
                    <>
                        <Button
                            fluid
                            as={ Link } to='/createActivity'
                            positive content={ t('create') + t('event') }
                        />
                        <Divider />
                    </>
                )
            }
            <Grid>
                <Grid.Column width={ isMobile ? '16' : '10' }>
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
                {
                    !isMobile && (
                        <Grid.Column width='6'>
                            <ActivityFilters />
                        </Grid.Column>
                    )
                }
                <Grid.Column width='10'>
                    <Loader active={ loadingNext } />
                </Grid.Column>
            </Grid>
        </>
    )
})