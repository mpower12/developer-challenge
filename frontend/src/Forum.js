import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import {TextField, CircularProgress, IconButton, Breadcrumbs, Drawer, makeStyles} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline';
import Typography from '@material-ui/core/Typography';

const drawerWidth = 500;

export const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: 'auto',
    paddingTop: theme.spacing(8),
    paddingLeft: theme.spacing(2)
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },

}));

export const Forum = (props) => {

    const classes = useStyles();
  
    let { id } = useParams();
  
    const [selectedThread, setSelectedThread] = useState(undefined);
  
    const [forumObj, setSelectedForumObj] = useState(null);

    const [addingThread, setAddingThread] = useState(false);
  
    async function getSingleForum() {
      try {
        const res = await fetch(`/api/forum/${id}`);
        const _forums = await res.json().then(response => {
          setSelectedForumObj(response);
        }).catch(error => {
          console.log(error);
        });
      } catch(err) {
        console.log(err);
      }
    }


    useEffect(() => {
      if (id) {
        console.log('Paged loaded with id: ' + id);
        props.setSelected(id);
        if(props.initialized) {
          setSelectedForumObj(props.getForum(id));
        } else {
          getSingleForum();
        }
  
      }
    }, []);
  
    function renderThreadLinks() {
      
      let fThreadList = [];
      console.log(props);
      if (Array.isArray(props.threads)) {
        props.threads.forEach(fThread => {
          fThreadList.push(<ThreadLink key={fThread.id} thread={fThread} setThread={setSelectedThread}/>)
        });
      }
      return fThreadList;
    }

    function clearSelectedThread() {
      setSelectedThread(undefined);
    }
  
    return (
      <div className={classes.root} style={{paddingTop: '64px'}}>
        <Drawer variant="permanent" anchor="left" className={classes.drawer} classes={{paper: classes.drawerPaper}}>
          <Grid className={classes.drawerContainer} container direction="column" alignItems="flex-start">
            {forumObj ? 
            <Typography variant="h4" component="h2">
            {forumObj.forumName}
            </Typography>

            : null}
            <br></br>
            <Grid container item alignItems="center">
              <Grid item style={{paddingRight: '24px'}}>
              <Typography variant="h4" component="h3">
                Threads
              </Typography>
              </Grid>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" onClick={() => setAddingThread(true)}>
                New Thread
              </Button>
            </Grid>
            <Grid item>
              <Divider/>
            </Grid>
            <Grid item container direction="column">
              {!props.threads || props.threads.length === 0 ? 
                <p>No threads please add one!</p>
              : renderThreadLinks()}
            </Grid>
          </Grid>
        </Drawer>
        <main className={classes.content}>
        {selectedThread && !addingThread ?
            <FThread forumId={id} thread={selectedThread} clearThread={clearSelectedThread} />
        : null}
        {addingThread ? 
          <NewThreadForm forumAddress={forumObj.address} setAddingThread={setAddingThread} refreshForum={props.getForumThreads} />
          : null
        }
        </main>
      </div>
    );
  };
  
 const ThreadLink = (props) => {
  
    function setThread() {
      props.setThread(props.thread);
    }
  
    return(
      <div>
      <Grid container direction="row" alignItems="center" justify="space-between">
        <Grid item style={{paddingRight: '4px'}}>
          <p>{props.thread.threadName + ' | Created By: ' + props.thread.createdBy}</p>
        </Grid>
        <Grid item>
          <IconButton edge="start" onClick={setThread}>
            <ViewHeadlineIcon/>
          </IconButton>
        </Grid>
      </Grid>
      <Divider variant="fullwidth"/>
      </div>
      // <span>
      //   <p>{props.thread.threadName + ' | Created By: ' + props.thread.createdBy}</p>
      //   <IconButton edge="start" onClick={setThread}>
      //        <ViewHeadlineIcon/>
      //      </IconButton>
      // </span>
    )
  
  }
  
 const FThread = (props) => {
  
    const [selectedThread, setSelectedThread] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [addingPost, setAddingPost] = useState(false);

    async function getThread() {
      setLoading(true);
      try {
        const res = await fetch(`/api/forum/${props.forumId}/thread/${props.thread.id}`);
        await res.json().then(response => {
          setSelectedThread(response);
          setLoading(false);
        }).catch(error => {
          console.log(error);
          setLoading(false);
        });
      } catch(err) {
        console.log(err);
        setLoading(false);
      }
    }
    useEffect(() => {
      getThread();
    }, [props.thread]);
  
    function renderFPosts() {
      let posts = [];
  
      if (selectedThread && selectedThread.posts) {
        selectedThread.posts.forEach((fPost,index) => {
          posts.push(<FPost key={'post-' + index} post={fPost}/>)
        });
      }
  
      return posts;
    }

    function clearSelectedThread() {
      setSelectedThread(undefined);
      props.clearThread();
      
    }
  
    return (
      <Grid container direction="column">
        <Typography variant="h4">
          {props.thread.threadName}
        </Typography>
        <Grid container item direction="row" justify="space-between">
          <IconButton edge="start" color="inherit" aria-label="home" onClick={getThread}>
            <RefreshIcon/>
          </IconButton>
          <Button variant="outlined" color="secondary" onClick={clearSelectedThread}>
            Close
          </Button>
        </Grid>

        <Typography variant="h6">
          {"Created By: " + props.thread.createdBy}
        </Typography>

        <Divider/>
        {loading ? 
        <Grid container alignItems="center" justify="center">
          <CircularProgress/>
        </Grid>
        :renderFPosts()}
        {!addingPost ?
        <Grid style={{paddingTop: '8px'}}>
          <Button variant="outlined" color="primary" onClick={() => setAddingPost(true)}>
            New Post
          </Button>
        </Grid>
        : <NewPostForm forumAddress={props.forumId} thread={props.thread} refreshThread={getThread} setAddingPost={setAddingPost} /> }
        
      </Grid>
    )
  }
  
  const NewPostForm = (props) => {

    const [postBody, setPostBody] = useState('');
    const [posterName, setPosterName] = useState('');
    const [loading, setLoading] = useState(false);

    async function createPost() {
      setLoading(true);
      try {
        const res = await fetch('/api/forum/' + props.forumAddress + '/thread/' + props.thread.id, {
          method: 'POST',
          body: JSON.stringify({
            postedBy: posterName,
            postBody: postBody,
          }),
          headers: { 'Content-Type': 'application/json' }
        });
        await res.json().then(response => {
          props.refreshThread();
          clearFields();
          //console.log('Thread has been added');
          //props.refreshForum();
          //props.setAddingThread(false);
          setLoading(false);
        }).catch(error => {
          console.log(error);
          setLoading(false);
        });
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
 
    }

    function handlePostBodyChange(event) {
      setPostBody(event.target.value);
    }

    function handlePosterNameChange(event) {
      setPosterName(event.target.value);
    }

    function clearFields() {
      setPosterName('');
      setPostBody('');
      props.setAddingPost(false);
    }

    function handleSubmit(event) {
      event.preventDefault();
      if (posterName === '' || postBody === '') {
        return;
      }
      createPost();
    }

    return(
      <div>
        {loading ? 
          <div>
            <Grid container direction="column" justify="center" alignItems="center" style={{paddingTop: '4px'}}>
              <Grid item>
                <CircularProgress />
              </Grid>
              <Grid item>
                <p>Loading new post please wait...</p>
              </Grid>
            </Grid>
          </div>
            :
      <form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container direction="column" spacing={1} style={{paddingTop: '4px'}}>
            <Grid item>
            <TextField error={postBody === ''} helperText={postBody === '' ? "Post body required." : ''} 
              onChange={handlePostBodyChange} value={postBody} 
              style={{width: '100%'}} id="name" 
              label="Post Body" variant="outlined" required multiline rows={5} />
            </Grid>
            <Grid item>
            <TextField error={posterName === ''} helperText={posterName === '' ? "Name required." : ''} 
              onChange={handlePosterNameChange} value={posterName} 
              style={{width: '100%'}} id="name" 
              label="Poster Name" variant="outlined" required />
            </Grid>
            <Grid item container direction="row" spacing={2}>
              <Grid item>
                <Button variant="contained" color="primary" type="submit">
                  Submit
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" color="secondary" onClick={clearFields}>
                  Cancel
                </Button>
              </Grid>

            </Grid>
        </Grid>
      </form>
  }
      </div>
    )
  }

  const FPost = (props) => {
  
  
    return (
      <Grid container direction="column">
        <Grid item>
        <Typography variant="caption">
          Post# - {props.post.id}
        </Typography>
        </Grid>
        <Grid item>
        <Typography variant="body1">
          {props.post.postBody}
        </Typography>
          </Grid>
          <Grid item>
          <Typography variant="overline">
          {"Posted By - " + props.post.postedBy}
        </Typography>
          </Grid>
        <Divider />
      </Grid>
    )
  }

  const NewThreadForm = (props) => {
    
    const [name, setName] = useState('');

    const [postBody, setPostBody] = useState('');

    const [posterName, setPosterName] = useState('');

    const [loading, setLoading] = useState(false);

    async function createThread() {
      setLoading(true);
      try {
        const res = await fetch('/api/forum/' + props.forumAddress + '/thread', {
          method: 'POST',
          body: JSON.stringify({
            createdBy: posterName,
            postBody: postBody,
            threadName: name
          }),
          headers: { 'Content-Type': 'application/json' }
        });
        await res.json().then(response => {
          console.log('Thread has been added');
          props.refreshForum();
          props.setAddingThread(false);
        }).catch(error => {
          console.log(error);
          setLoading(false);
        });
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
 
    }

    function handleNameChange(event) {
      setName(event.target.value);
    }

    function handlePostChange(event) {
      setPostBody(event.target.value);
    }

    function handlePosterNameChange(event) {
      setPosterName(event.target.value);
    }

    function handleSubmit(event) {
      event.preventDefault();
      console.log(event);
      if (name === '' || postBody === '' || posterName === '') {
        return;
      }
      createThread();
    }

    function getForm() {
      return (
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container direction="column" spacing={2}>
           
          <Grid container item xs={12} alignItems="center" justify="center">
            <h2>Create a new Thread!</h2>
          </Grid>
            <Grid item container direction="column" spacing={2} xs={12}>
             
                <Grid container spacing={2}>
              <Grid container item xs={6}>
                <TextField error={name === ''} helperText={name === '' ? "Thread name required." : ''} onChange={handleNameChange} value={name} style={{width: '100%'}} id="name" label="Thread Name" variant="outlined" required />
  
              </Grid>
              <Grid container item xs={10}>
                <TextField error={postBody === ''} helperText={postBody === '' ? "Post body required." : ''} onChange={handlePostChange} value={postBody} style={{width: '100%'}} id="post" label="Post" variant="outlined" required multiline rows={20}/>
              </Grid>
              <Grid container item xs={6}>
                <TextField error={posterName === ''} helperText={posterName === '' ? "Poster name required." : ''} onChange={handlePosterNameChange} value={posterName} style={{width: '100%'}} id="name" label="Poster Name" variant="outlined" required />
              </Grid>
              </Grid>
  
            </Grid>
          <Grid container item direction="row" alignItems="flex-start" spacing={2}>
            <Grid item>
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
            </Grid>
            <Grid item>
            <Button variant="outlined" color="secondary" onClick={() => props.setAddingThread(false)}>
              Cancel
            </Button>
            </Grid>
          </Grid>
        </Grid>
        </form>
      );
    }
    if (!loading) {
      return getForm();
    }else {
      return (
        <Grid container direction="column" alignItems="center" justify="center" spacing={2}>
          <Grid item container direction="row" alignItems="center" justify="center">
            <CircularProgress />
          </Grid>
          <Grid item>
            <p>Creating new thread please wait...</p>
          </Grid>
        </Grid>
      )
    }

  }