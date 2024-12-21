import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import {baseUrl} from '../../constant/url'
import {useQuery} from '@tanstack/react-query'
import { useEffect } from "react";

const Posts = ({feedType,username,userId}) => {

	const getPostEndPoint = ()=>{
		switch(feedType){
			case "forYou" :
				return `${baseUrl}/api/posts/all`
			case "following" :
				return `${baseUrl}/api/posts/following`
			case "posts" :
				return `${baseUrl}/api/posts/user/${username}`
			case "likes" :
				return `${baseUrl}/api/posts/likes/${userId}`
			default :
			    return `${baseUrl}/api/posts/all`
		}
	}

	const POST_ENDPOINT = getPostEndPoint() // here we get the url to display the posts
	                                         // from backend
	
    const {data:posts,isLoading , refetch , isRefetching} = useQuery({
		queryKey:["posts"],
		queryFn : async()=>{
			try {
				const res = await fetch(POST_ENDPOINT,{
					method : "GET",
					credentials : 'include',
					headers : {
						"Content-Type":"application/json"
					}
				})
				const data = await res.json()

				if(!res.ok){
					throw new Error(data.error||"something went wrong")
				}
				return data
			} catch (error) {
				throw error;
			}
		}
	})

	useEffect(()=>{  //if we change the feed type in feed this useeffect will be called
		refetch()
	},[feedType,refetch,username])

	return (
		<>
    {/* if the posts are loading we show the skeleton */}
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
      {/* if the posts are not present in the backend*/}
			{!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			
      {/* if the posts are present we use map function and send each post to
           the post component */}
      {!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;