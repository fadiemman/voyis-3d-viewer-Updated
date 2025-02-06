import React, { useState } from 'react';
import { X, Loader2 } from "lucide-react";

function Sidebar({ isOpen, onClose }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        const validExtensions = ['.pcd', '.json'];
        const isValidFile = validExtensions.some(ext => file?.name.toLowerCase().endsWith(ext));

        if (file && isValidFile) {
            setIsLoading(true);
            try {
                console.log("File uploaded:", file.name);
                // Add your file processing logic here
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated processing
            } catch (error) {
                console.error("Error processing file:", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            alert("Only PCB and GLS files are allowed!");
        }
    };

    return (
        isOpen && (
            <div className="fixed left-0 top-0 w-64 h-full bg-gray-200 dark:bg-gray-800 p-4 shadow-lg z-40">
                <button onClick={onClose} className="p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full">
                    <X size={24} />
                </button>

                <div className="mt-6 p-4 border-2 border-dashed border-gray-400 justify-center rounded-lg text-center">
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept=".pcd,.json"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                        <div className="p-2 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center gap-2">
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Processing...
                                </>
                            ) : (
                                "Upload PCB or GLS File"
                            )}
                        </div>
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Accepted formats: .pcb, .gls
                    </p>
                </div>
            </div>
        )
    );
}

export default Sidebar;