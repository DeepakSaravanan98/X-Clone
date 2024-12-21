import { Link } from "react-router-dom";
import { useState } from "react";
import XSvg from "../../../components/svgs/X";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import {useMutation} from '@tanstack/react-query'
import { baseUrl } from "../../../constant/url";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		username: "",               // all the data we enter in signup page is put into
		fullName: "",               //    this object
		password: "",
	});

	const { mutate : signup, isPending , isError , error} = useMutation ({
		mutationFn : async ({email , username , fullName , password})=>{
			try {
				const res = await fetch(`${baseUrl}/api/auth/signup`,{
					method : 'POST', //signup is a post method
					credentials : "include", //we need the cookie to store in the browser so we are including the credentials
				    headers :{
						"Content-Type" : "application/json", //the data will be in
						"Accept" : "application/json"        //   JSON format
					},
					// we are sending the paramters in body from frontend and 
					//changing the properties from js object to json using stringify
					body : JSON.stringify({email,username,fullName,password})
				})
             
				// getting the data from the response received
				const data = await res.json();
				// if the response has some problem
				if(!res.ok){
					throw new Error(data.error||"something went wrong")
				}
				console.log(data)
				return data;
			} catch (error) {
				throw error
			}
		},
		onSuccess : ()=>{ // this executed if the mutationfn completes successfully
			toast("User Created Successfully")
		}
	})

	const handleSubmit = (e) => {    // once we click signup button this function submits
		e.preventDefault();                  // data into backend
		signup(formData)
	};

	const handleInputChange = (e) => { // type each letter in the fields and updating in the form data
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};


	return ( 
		<div className='max-w-screen-xl mx-auto flex h-screen px-10'> 
			<div className='flex-1 hidden lg:flex items-center  justify-center'> 
				<XSvg className=' lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />  {/* large X icon
                       will be hidden in small screen */}
					<h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='email'
							className='grow'
							placeholder='Email'
							name='email'
							onChange={handleInputChange}
							value={formData.email}
						/>
					</label>
					<div className='flex gap-4 flex-wrap'>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<FaUser />
							<input
								type='text'
								className='grow '
								placeholder='Username'
								name='username'
								onChange={handleInputChange}
								value={formData.username}
							/>
						</label>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<MdDriveFileRenameOutline />
							<input
								type='text'
								className='grow'
								placeholder='Full Name'
								name='fullName'
								onChange={handleInputChange}
								value={formData.fullName}
							/>
						</label>
					</div>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white'>
						{isPending ? <LoadingSpinner/> : "Sign Up"}
					</button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
					<p className='text-white text-lg'>Already have an account?</p>
					<Link to='/login'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign in</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default SignUpPage;