export function getStackSteps(operations) {
  const steps = []
  const stack = []

  steps.push({
    stack: [...stack],
    operation: null,
    operationValue: null,
    message: 'Stack is empty. Ready for operations!',
    type: 'idle'
  })

  for (const op of operations) {
    if (op.type === 'push') {
      steps.push({
        stack: [...stack],
        operation: 'push',
        operationValue: op.value,
        message: `Pushing ${op.value} onto the stack...`,
        type: 'incoming'
      })
      stack.push(op.value)
      steps.push({
        stack: [...stack],
        operation: 'push',
        operationValue: op.value,
        message: `✅ ${op.value} pushed! It's now on TOP.`,
        type: 'pushed',
        highlightTop: true
      })
    } else if (op.type === 'pop') {
      if (stack.length === 0) {
        steps.push({
          stack: [...stack],
          operation: 'pop',
          operationValue: null,
          message: '❌ Stack is empty! Cannot pop.',
          type: 'error'
        })
      } else {
        const popped = stack[stack.length - 1]
        steps.push({
          stack: [...stack],
          operation: 'pop',
          operationValue: popped,
          message: `Popping ${popped} from the top...`,
          type: 'popping',
          highlightTop: true
        })
        stack.pop()
        steps.push({
          stack: [...stack],
          operation: 'pop',
          operationValue: popped,
          message: `✅ ${popped} popped from stack!`,
          type: 'popped'
        })
      }
    } else if (op.type === 'peek') {
      if (stack.length === 0) {
        steps.push({
          stack: [...stack],
          operation: 'peek',
          operationValue: null,
          message: '❌ Stack is empty! Nothing to peek.',
          type: 'error'
        })
      } else {
        const top = stack[stack.length - 1]
        steps.push({
          stack: [...stack],
          operation: 'peek',
          operationValue: top,
          message: `👀 Peek: Top element is ${top}`,
          type: 'peek',
          highlightTop: true
        })
      }
    }
  }

  steps.push({
    stack: [...stack],
    operation: null,
    operationValue: null,
    message: `Done! Final stack has ${stack.length} element${stack.length !== 1 ? 's' : ''}.`,
    type: 'done'
  })

  return steps
}