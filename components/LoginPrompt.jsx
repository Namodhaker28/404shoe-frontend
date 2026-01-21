import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";

/**
 * LoginPrompt component - Modal to prompt user to login
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Function to close the modal
 * @param {string} message - Custom message to display
 */
const LoginPrompt = ({ isOpen, onClose, message = "Please login to continue" }) => {
  const router = useRouter();

  /**
   * Handle login button click - redirect to login page
   */
  const handleLogin = () => {
    onClose();
    router.push("/auth/login");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-white mb-4">
                  Login Required
                </Dialog.Title>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-300 mb-6">
                    {message}
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
                    onClick={handleLogin}>
                    Login
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LoginPrompt;
