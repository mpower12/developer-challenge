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
import {AppBar, Toolbar, IconButton, Breadcrumbs, TextField, makeStyles, Typography, CircularProgress, LinearProgress} from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import {Forum } from './Forum';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';


const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  }
}));

function App() {

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [initialized, setInitialized] = useState(false);

  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState('');
  const [selectedForumObj, setSelectedForumObj] = useState(null);
  const [selectedForumThreads, setSelectedForumThreads] = useState([]);

  const classes = useStyles();
  
  async function getForums() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/forum`);
      const _forums = await res.json().then(response => {
        setForums(response);
      }).catch(error => {
        console.log(error);
      });
    } catch(err) {
      setErrorMsg(err.stack)
    }
    setLoading(false);
  }

  async function getForumThreads() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/forum/${selectedForum}/thread`);
      const _threads = await res.json().then(response => {
        setSelectedForumThreads(response);
      }).catch(error => {
        console.log(error);
      });
    } catch(err) {
      setErrorMsg(err.stack)
    }
    setLoading(false);
  }


  function getForum(id) {
    let retForum = null;
    // console.log('Getting forum: ' + id);
    // console.log(forums);
    if (forums) {
      forums.forEach(forum => {
        console.log('Forum ID: ' + forum.address);
        if (forum.address.toString() === id.toString()) {
          retForum = forum;
          return;
        }
      });
    }
    console.log(retForum);
    return retForum;
  }

  function updateForum(forumObj) {
    if(!forums) {
      setForums([forumObj]);
    }
    if(forums.length === 0) {
      setForums([forumObj]);
    }
    let ind = -1;
    forums.forEach((forum, index) => {
      if (forum.address === forumObj.address) {
        ind = index;
        return;
      }
    });
    if (ind !== -1) {
      forums.splice(ind, 1);
      forums.push(forumObj);
    }

  }

  useEffect(() => {
    getForums();
  }, [])

  useEffect(() => {
    // console.log('The selected forum has been updated. ID is: ' + selectedForum);
    if (!initialized) {
      getForums();
      setInitialized(true);
    }
    if (selectedForum) {
      getForumThreads();
      let obj = getForum(selectedForum);
      setSelectedForumObj(obj);
    }
  },[selectedForum]);

  return (
    <Router>
      <Grid container spacing={1} direction="column">
        <Grid container item direction="row">
          <AppBar position="fixed" className={classes.appBar}>
            <Toolbar >
              <IconButton edge="start" color="inherit" to="/" component={Link} aria-label="home">
                <HomeIcon/>
              </IconButton>
            </Toolbar>
          </AppBar>
        </Grid>

      </Grid>

      <Switch>
        <Route exact path="/">
          <Home forums={forums} setSelected={setSelectedForum} loading={loading} getForums={getForums} />
        </Route>
        <Route path="/forum/:id">
          <Forum forumObj={selectedForumObj} 
          getForum={getForum} 
          selected={selectedForum} 
          threads={selectedForumThreads} 
          setSelected={setSelectedForum}
          getForumThreads={getForumThreads}
          initialized={initialized}/>
        </Route>
      </Switch>
    </Router>
  );
}

const Home = ({forums, setSelected, loading, getForums}) => {

  const [addingForum, setAddingForum] = useState(false);



  return (
  <Grid container direction="column" alignItems="center" style={{paddingTop: '68px'}} spacing={2}>
    <Grid item container direction="row" justify="space-between" alignItems="center" >
    <Grid item>
      <div></div>
    </Grid>
    <Grid item>
      <Typography variant="h4" component="h2" style={{marginLeft: '100px'}}>
        {addingForum ? 'Create a Forum' : 'Browse Forums'}
      </Typography>
    </Grid>
    <Grid item>
      <Button variant="outlined" onClick={() => setAddingForum(true)} disabled={addingForum} style={{marginRight: '8px'}}>
        New Forum
      </Button>
    </Grid>

    </Grid>
      {loading && !addingForum ? 
      <Grid container direction="column" item justify="center" alignItems="center" style={{paddingTop: '64px'}}>
        <Grid item>
          <CircularProgress/>
        </Grid>
        <Grid item>
          <p>Loading forums please wait...</p>
        </Grid>
      </Grid>
      : null}
      {addingForum ? 
        <AddForumForm setAddingForum={setAddingForum} getForums={getForums}/>
        :<ForumList forums={forums}  />}
      
  </Grid>
  );
}

const ForumList = (props) => {

  function renderForumListItems() {
    let forumList = [];

    if (props.forums) {
      props.forums.forEach(forum => {
        forumList.push(<ForumListItem key={forum.address} forum={forum} />)
      });
    }
    return forumList;
  }

  return (
    <Grid>
      <List>
        {renderForumListItems()}
      </List>
    </Grid>

  )
}

const ForumListItem = (props) => {
  
  return(
    <ListItem>
      <ListItemText >
        {props.forum.forumName + " | " + props.forum.forumDescription}
      </ListItemText>
      <IconButton to={"/forum/" + props.forum.address} component={Link}>
        <KeyboardArrowRightIcon/>
      </IconButton>
    </ListItem>
  )
}

const AddForumForm = (props) => {

  const [forumName, setForumName] = useState('');
  const [forumDescription, setForumDescription] = useState('');
  const [forumProgress, setForumProgress] = useState(false);

  async function createForum() {
    setForumProgress(true);
    try {
      const res = await fetch('/api/forum/', {
        method: 'POST',
        body: JSON.stringify({
          forumName: forumName,
          forumDescription: forumDescription,
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      await res.json().then(response => {
        props.getForums();
        props.setAddingForum(false);
      }).catch(error => {
        console.log(error);
        setForumProgress(false);
      });
    } catch (err) {
      console.log(err);
      setForumProgress(false);
    }

  }

  function handleForumNameChange(event) {
    setForumName(event.target.value);
  }

  function handleDescriptionChange(event) {
    setForumDescription(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (forumName === '' || forumDescription === '') {
      return;
    }

    createForum();

  }

  return (
    <form noValidate autoComplete="off" onSubmit={handleSubmit} style={{width: '50%'}}>
      <Grid container direction="column" spacing={2}>
        <Grid item>
        <TextField error={forumName === ''} helperText={forumName === '' ? "Name required." : ''} 
              onChange={handleForumNameChange} value={forumName} 
              style={{width: '100%'}} id="name" 
              label="Forum Name" variant="outlined" required />
        </Grid>
        <Grid item>
        <TextField error={forumDescription === ''} helperText={forumDescription === '' ? "Description required." : ''} 
              onChange={handleDescriptionChange} value={forumDescription} 
              style={{width: '100%'}} id="name" 
              label="Description" variant="outlined" required multiline rows={3} />
        </Grid>
        <Grid item container direction="row" justify="center" spacing={2}>
          <Grid item>
            <Button variant="contained" color="primary" type="submit" disabled={forumProgress}>
              Submit
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="secondary" onClick={() => props.setAddingForum(false)} disabled={forumProgress}>
              Cancel
            </Button>
          </Grid>
        </Grid>
        {forumProgress ?
        <Grid item container direction="column" spacing={2}>
          <Grid item>
            <LinearProgress />
          </Grid>
          <Grid item>
            <p>Creating forum please wait...</p>
          </Grid>
        </Grid>
        : null}
      </Grid>
    </form>
  )
}

export default App;
