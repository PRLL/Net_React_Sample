import React from 'react';
import { Duck } from './test-typescript_stuff';

interface Props {
    duck: Duck;
}

export default function DuckItem({duck}: Props) {
    return (
        <div>
          <span>{duck.name}</span>
          <button onClick={() => duck.makeSound!(duck.name + ' quack')}>Make Sound</button>
        </div>
    )
}