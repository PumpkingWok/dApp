import React, { Component } from 'react';
import { Layout, Row, Col } from 'antd';

import TradeContainer from './TradeContainer';
import { MarketJS } from '../../util/marketjs/marketMiddleware';

import '../../less/Trades.less';

const { Content } = Layout;

class Trades extends Component {
  constructor(props) {
    super(props);

    this.getOrders = this.getOrders.bind(this);
    this.getUnallocatedCollateral = this.getUnallocatedCollateral.bind(this);

    this.state = {
      unallocatedCollateral: 0
    };
  }

  componentDidMount() {
    const { simExchange } = this.props;

    if (
      simExchange.contract !== null &&
      simExchange.contract.MARKET_COLLATERAL_POOL_ADDRESS
    ) {
      this.getUnallocatedCollateral(
        simExchange.contract.MARKET_COLLATERAL_POOL_ADDRESS
      );
      this.getOrders(simExchange.contract.key);
    }
  }

  componentWillReceiveProps(nextProps) {
    const newContract = nextProps.simExchange.contract;
    const oldContract = this.props.simExchange.contract;

    if (newContract !== oldContract && newContract !== null) {
      this.getUnallocatedCollateral(nextProps);
      this.getOrders(nextProps.simExchange.contract.key);
    }
  }

  getOrders(contractAddress) {
    fetch(`https://dev.api.marketprotocol.io/orders/${contractAddress}/`)
      .then(function(response) {
        return response.json();
      })
      .then(
        function(response) {
          this.setState({
            buys: response.buys,
            sells: response.sells,
            contract: response.contract
          });
        }.bind(this)
      );
  }

  getUnallocatedCollateral(props) {
    const { simExchange } = props;

    MarketJS.getUserAccountBalanceAsync(simExchange.contract, true).then(
      balance => {
        this.setState({
          unallocatedCollateral: balance
        });
      }
    );
  }

  render() {
    const { unallocatedCollateral, buys, sells } = this.state;
    const { simExchange } = this.props;

    console.log('buys/sells', buys, sells);

    return (
      <Layout id="trading">
        <Content>
          <Row type="flex" justify="flex-start">
            <span className="trading-balance">
              Available for Trading: {unallocatedCollateral}{' '}
              {simExchange.contract &&
                simExchange.contract.COLLATERAL_TOKEN_SYMBOL}
            </span>
          </Row>
          <Row type="flex" justify="space-around" gutter={24}>
            <Col span={12}>
              <TradeContainer
                {...this.props}
                type="bids"
                market=""
                data={buys}
              />
            </Col>
            <Col span={12}>
              <TradeContainer
                {...this.props}
                type="asks"
                market=""
                data={sells}
              />
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }
}

export default Trades;
