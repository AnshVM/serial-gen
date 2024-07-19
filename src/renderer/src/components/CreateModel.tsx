import { Button, Input, Select } from "@chakra-ui/react"
import { profileEnd } from "console";
import { useEffect, useState } from "react";

type Model = {
    name: string;
    code: string;
    productName: string;
}

type SerialNumber = {
    serial: string;
    company: string;
    sequence: number;
    createdAt: Date;
    modelName: string;
}

export default function CreateModel() {
    // name code productName

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [productName, setProductName] = useState('');
    const [error,setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSaveModel = async () => {
        console.log(name, code, productName)
        const ok = await window.api.createModel(name, code, productName);
        console.log(ok)
        if(!ok) {
            setError('There was an error while creating the model');
            setMessage('');
        } else {
            setMessage('Model saved successfully')
            setError('');
        }
    }

    return (
        <div className="pt-4 flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-center text-teal-700">Create Model</h1>
            <div className="flex flex-row gap-4 px-4">
                <Input placeholder="Model name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Model code" value={code} onChange={(e) => setCode(e.target.value)} />
                <Input placeholder="Product name" value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <Button
                colorScheme="teal"
                variant={'solid'}
                className="w-fit mx-auto"
                onClick={handleSaveModel} 
                >
                Create Model
            </Button>

            <div className="text-center">
                {error || message}
            </div>
        </div>
    )
}