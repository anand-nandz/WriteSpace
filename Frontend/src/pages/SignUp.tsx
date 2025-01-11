import {
    Card,
    Input,
    Button,
    Link,
    Spinner,
    CardFooter,
} from "@nextui-org/react";
import { Eye, EyeOff } from 'lucide-react';
import { USER } from '../utils/constants/constants';
import { useSignup } from '../hooks/useSignUp';

const SignUp = () => {
    const {
        formValues,
        formErrors,
        isLoading,
        showPassword1,
        showPassword2,
        handleChange,
        submitHandler,
        togglePasswordVisibility1,
        togglePasswordVisibility2,
    } = useSignup()
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] py-2 px-4">
          <Card className="w-full max-w-[1000px] md:p-6 bg-white shadow-xl p-4 ">
            <div className="flex flex-col md:flex-row">
              {/* Left Side - Image */}
              <div className="hidden md:flex flex-1 relative min-h-[300px] md:min-h-[500px] rounded-2xl overflow-hidden">
                <img
                  src="/images/login.png"
                  alt="Login illustration"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br " />
              </div>
    
              {/* Right Side - Form */}
              <div className="flex-1 flex flex-col md:p-8 justify-center">
                <h1 className="text-2xl text-center font-semibold mb-4 text-[#333]">
                  Sign Up
                </h1>
                <form onSubmit={submitHandler} className="space-y-5">
                  <div>
                    <Input
                      id="name"
                      type="text"
                      label="Name"
                      name="name"
                      variant="bordered"
                      placeholder="Enter your name"
                      onChange={handleChange}
                      value={formValues.name}
                      isInvalid={!!formErrors.name}
                      errorMessage={formErrors.name}
                      classNames={{
                        base: "w-full",
                        mainWrapper: "w-full",
                        input: "bg-transparent",
                        inputWrapper: "border-gray-300 h-14",
                      }}
                    />
                  </div>
    
                  <div>
                    <Input
                      id="email"
                      type="email"
                      label="E-mail"
                      name="email"
                      variant="bordered"
                      placeholder="Enter your email"
                      onChange={handleChange}
                      value={formValues.email}
                      isInvalid={!!formErrors.email}
                      errorMessage={formErrors.email}
                      classNames={{
                        base: "w-full",
                        mainWrapper: "w-full",
                        input: "bg-transparent",
                        inputWrapper: "border-gray-300 h-14",
                      }}
                    />
                  </div>
    
                  <div>
                    <Input
                      id="contactinfo"
                      type="text"
                      label="Contact Info"
                      name="contactinfo"
                      variant="bordered"
                      placeholder="Enter your phone number"
                      onChange={handleChange}
                      value={formValues.contactinfo}
                      isInvalid={!!formErrors.contactinfo}
                      errorMessage={formErrors.contactinfo}
                      classNames={{
                        base: "w-full",
                        mainWrapper: "w-full",
                        input: "bg-transparent",
                        inputWrapper: "border-gray-300 h-14 ",
                      }}
                    />
                  </div>
    
                  <div>
                    <Input
                      id="password"
                      type={showPassword1 ? "text" : "password"}
                      label="Password"
                      name="password"
                      variant="bordered"
                      placeholder="Enter your password"
                      onChange={handleChange}
                      value={formValues.password}
                      isInvalid={!!formErrors.password}
                      errorMessage={formErrors.password}
                      endContent={
                        <button
                          className="focus:outline-none "
                          type="button"
                          onClick={togglePasswordVisibility1}
                        >
                          {showPassword1 ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                      }
                      classNames={{
                        base: "w-full",
                        mainWrapper: "w-full",
                        input: "bg-transparent",
                        inputWrapper: "border-gray-300 h-14",
                      }}
                    />
                  </div>
    
                  <div>
                    <Input
                      id="confirmPassword"
                      type={showPassword2 ? "text" : "password"}
                      label="Confirm Password"
                      name="confirmPassword"
                      variant="bordered"
                      placeholder="Confirm your password"
                      onChange={handleChange}
                      value={formValues.confirmPassword}
                      isInvalid={!!formErrors.confirmPassword}
                      errorMessage={formErrors.confirmPassword}
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={togglePasswordVisibility2}
                        >
                          {showPassword2 ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                      }
                      classNames={{
                        base: "w-full",
                        mainWrapper: "w-full",
                        input: "bg-transparent",
                        inputWrapper: "border-gray-300 h-14",
                      }}
                    />
                  </div>
    
                  <div className="flex justify-center mt-8">
                    <Button
                      className="w-full bg-gray-900 text-white"
                      size="lg"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner size="sm" />
                          <span className="ml-2">Sending OTP...</span>
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </div>
                </form>
    
                <CardFooter className="flex justify-center">
                  <div className="text-center text-sm">
                    Already have an Account?{" "}
                    <Link href={USER.LOGIN} className="text-gray-800 font-semibold">
                      Login
                    </Link>
                    <div>
                        <Link href={USER.LANDINGPAGE} className="text-black">
                            <h2 className="font-bold text-inherit text-black text-center">Explore WriteSpace</h2>
                        </Link>

                    </div>
                  </div>
                </CardFooter>
              </div>
            </div>
          </Card>
        </div>
      );

}

export default SignUp