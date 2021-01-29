pragma solidity >=0.4.24 <0.6.0;
pragma experimental ABIEncoderV2;


/**
  * @title Forum
  * @dev Create and manage forum threads and posts
  */
contract forum {
    /**
     * @dev the name of the forum
     */
    string public _forumName;

    /**
     * @dev the description of the forum
     */
    string public _forumDescription;

    /**
     * @dev the version of the forum.  this is used to filter out old incompatible forums when requesting them.
     */
    string public _version = "0.0.4";

    /**
     * @dev represents a single thread
     */
    struct FThread {
      int id;

      string threadName;

      string createdBy;

      int postCount;

      bool isValue;

      mapping(int => FPost) posts;
    }

    /**
     * @dev Represents a forum thread without the posts used for getting
     * a list of threads
     */
    struct FThreadMeta {
      int id;

      string threadName;

      string createdBy;

      int postCount;

      bool isValue;
    }

    /**
     * @dev represents a single post.
     */
    struct FPost {
      int id;

      string postBody;

      string postedBy;

      int threadId;

      bool isValue;
    }

    // the number of threads
    int _threadCount;

    // the owner of the forum
    address public owner;

    // a mapping of threads to their id.
    mapping(int => FThread) public _threads;

    /**
      * @dev Constructor sets the default value
      * @param forumName The name of the forum
      * @param forumDescription the description of the forum
      */
    constructor(string memory forumName, string memory forumDescription) public {
        _forumName = forumName;
        _forumDescription = forumDescription;
        _threadCount = 0;
        owner = msg.sender;
    }
    /**
      * @dev Set the value
      * @param forumName The new value
      */
    function setName(string memory forumName) public {
        _forumName = forumName;
    }
    /**
      * @dev Get the value
      */
    function getName() public view returns (string memory forumName) {
        return _forumName;
    }


    /**
      * @dev Set the description
      * @param forumDescription The new value
      */
    function setDescription(string memory forumDescription) public {
        _forumDescription = forumDescription;
    }
    /**
      * @dev Get the description
      */
    function getDescription() public view returns (string memory forumDescription) {
        return _forumDescription;
    }
    /**
      * @dev Gets the forum information as a tuple
      */
    function getForumInfo() public view returns (string memory forumName, string memory forumDescription, string memory version) {
      return (_forumName, _forumDescription, _version);
    }

    /**
      * @dev Adds a new thread
      * @param threadName name of the new thread
      * @param createdBy creator of the thread
      * @param postBody body of the first post
      */
    function addThread(string memory threadName, string memory createdBy, string memory postBody) public {
      FThread memory t = FThread(_threadCount, threadName,createdBy, 1, true);
      _threads[_threadCount] = t;
      FThread storage st = _threads[_threadCount];
      if (st.isValue) {
      st.posts[0] = FPost(0, postBody,createdBy, _threadCount, true);
      }
      _threadCount++;
    }

    /**
      * @dev Get the number of threads
      */
    function getThreadCount() public view returns (int threadCount) {
      return _threadCount;
    }

    /**
      * @dev Get the number of posts in the specified thread.
      * @param threadId the id of the thread
      */
    function getThreadPostCount(int threadId) public view returns(int postCount) {
      return _threads[threadId].postCount;
    }

    /**
    * @dev Gets the thread information for the specified id
    * @param id the id of the thread
    */
    function getThread(int threadId) public view returns(int id, string memory threadName, string memory createdBy, int postCount) {
      if (_threads[threadId].isValue) {
        return (_threads[threadId].id, _threads[threadId].threadName, _threads[threadId].createdBy, _threads[threadId].postCount);
      } else {
        return (-1, "Thread does not exist", "n/a", 0);
      }
    }

    /**
    * @dev Add a post to the specified thread
    * @param postBody the body of the post
    * @param postedBy who created the post
    * @param threadId the thread to add the post to
    */
    function addPost(string memory postBody, string memory postedBy, int threadId) public {
      if (_threads[threadId].isValue) {
        FThread storage t = _threads[threadId];
        t.posts[t.postCount] = FPost(t.postCount, postBody,postedBy, threadId, true);
        t.postCount++;
      }
    }

      /**
      * @dev Gets the specific post
      * @param threadId the id of the thread to get the post from
      * @param postId the id of the post to get
      */
    function getPost(int threadId, int postId) public view returns(int id, string memory postBody, string memory postedBy, int ownerId) {
      if (_threads[threadId].isValue) {
        FThread storage t = _threads[threadId];
        if (t.posts[postId].isValue) {
          return (t.posts[postId].id, t.posts[postId].postBody, t.posts[postId].postedBy, threadId);
        }
      }
      return (-1, "Post not found in thread", "n/a", -1);
    }

    /**
      * @dev Gets all the posts from a thread
      * @param threadId the id of the thread
      */
    function getPosts(int threadId) public returns(FPost[] memory posts) {
      FThread storage t = _threads[threadId];
      FPost[] memory _posts = new FPost[](uint(t.postCount));
      for(int256 i = 0; i < int256(t.postCount); i++) {
        _posts[uint256(i)] = t.posts[i];
      }
      return _posts;
    }
    /**
      * @dev Gets all the threads
      */
    function getThreads() public returns(FThreadMeta[] memory threads) {
      FThreadMeta[] memory retThreads = new FThreadMeta[](uint(_threadCount));
      for(int256 i = 0; i < int256(_threadCount); i++) {
        FThreadMeta memory meta = FThreadMeta(_threads[i].id, _threads[i].threadName, _threads[i].createdBy, _threads[i].postCount, _threads[i].isValue);
        retThreads[uint256(i)] = meta;
      }
      return retThreads;
    }
}