import React from 'react'
import Identicon from 'identicon.js'

const Navbar = ({ account }) => {
	return (
		<nav className="navbar navbar-dark bg-dark p-0 text-monospace">
			D$t0r@g3
			<ul className="navbar-nav px-3">
				<li>
					<small id="account">
						<a
							target="_blank"
							alt=""
							className="text-white"
							rel="noopener noreferrer"
							href={'https://etherscan.io/address/' + account}
						>
							{account.substring(0, 6)}...{account.substring(38, 42)}
						</a>
					</small>
					{account ? (
						<img
							alt=""
							className="ml-2"
							width="30"
							height="30"
							src={`data:image/png;base54,${new Identicon(account, 30).toString()}`}
						/>
					) : (
						<span></span>
					)}
				</li>
			</ul>
		</nav>
	)
}

export default Navbar
