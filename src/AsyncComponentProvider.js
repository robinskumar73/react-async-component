import React, { Component } from 'react'
import PropTypes from 'prop-types'

import createAsyncContext from './createAsyncContext'

export default class AsyncComponentProvider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    asyncContext: PropTypes.shape({
      getNextId: PropTypes.func.isRequired,
      resolved: PropTypes.func.isRequired,
      failed: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }),
    rehydrateState: PropTypes.shape({
      resolved: PropTypes.object,
    }),
  }

  static defaultProps = {
    asyncContext: undefined,
    rehydrateState: {
      resolved: {},
    },
  }

  static childContextTypes = {
    asyncComponents: PropTypes.shape({
      getNextId: PropTypes.func.isRequired,
      resolved: PropTypes.func.isRequired,
      failed: PropTypes.func.isRequired,
      shouldRehydrate: PropTypes.func.isRequired,
      getError: PropTypes.func.isRequired,
    }).isRequired,
  }

  constructor(props, context) {
    super(props, context)
    this.asyncContext = props.asyncContext || createAsyncContext()
    this.rehydrateState = props.rehydrateState
  }

  getChildContext() {
    return {
      asyncComponents: {
        getNextId: this.asyncContext.getNextId,
        resolved: this.asyncContext.resolved,
        failed: this.asyncContext.failed,
        shouldRehydrate: id => {
          const resolved = this.rehydrateState.resolved[id]
          delete this.rehydrateState.resolved[id]
          return resolved
        },
        getError: id =>
          this.rehydrateState.errors && this.rehydrateState.errors[id],
      },
    }
  }

  render() {
    return React.Children.only(this.props.children)
  }
}
