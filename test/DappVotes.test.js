const {expect} = require('chai');
const {expectRevert} = require('@openzeppelin/test-helpers');

describe('Contract',  () =>  {
    let contract, result

    const description = 'description'
    const title = 'title'
    const image = 'https://image.png'
    const starts = Date.now() - 10 * 60 * 1000
    const ends = Date.now() + 10 * 60 * 1000
    const pollId = 1
    const contestantId = 1

    const avatar1 = 'https://avatar.png'
    const name1 = 'name1'
    const avatar2 = 'https://avatar2.png'
    const name2 = 'name2'

    beforeEach(async () => {
        const Contract = await ethers.getContractFactory('DappVotes')
        ;[deployer,contestant1,contestant2,voter1,voter2,voter3] = await ethers.getSigners()

        contract = await Contract.deploy()
        await contract.deployed()
    })

    describe('poll management', () => {
        describe('Successes', () => {
            it('should confirm poll creation success', async () => {
                result = await contract.getPolls()
                expect(result).to.have.lengthOf(0)

                await contract.createPoll(image, title, description, starts, ends)

                result = await contract.getPolls()
                expect(result).to.have.lengthOf(1)

                result = await contract.getPoll(pollId)
                expect(result.title).to.be.equal(title)
                expect(result.director).to.be.equal(deployer.address)
            })
            
            it('should confirm poll update success', async () => {
                await contract.createPoll(image, title, description, starts, ends)

                result = await contract.getPoll(pollId)
                expect(result.title).to.be.equal(title)

                await contract.updatePoll(pollId,image, "new title", description, starts, ends)

                result = await contract.getPoll(pollId)
                expect(result.title).to.be.equal("new title")
            })

            it('should confirm poll deletion success', async () => {
                await contract.createPoll(image, title, description, starts, ends)

                result = await contract.getPolls()
                expect(result).to.have.lengthOf(1)


                result = await contract.getPoll(pollId)
                expect(result.deleted).to.be.equal(false)

                await contract.deletePoll(pollId)

                result = await contract.getPolls()
                expect(result).to.have.lengthOf(0)


                result = await contract.getPoll(pollId)
                expect(result.deleted).to.be.equal(true)
            })

        })

        describe('Failures', () => {
            it('should confirm poll creation failure', async () => {
                await expectRevert(
                    contract.createPoll('', title, description, starts, starts),
                     'Image is required'
                    )
                await expectRevert(
                    contract.createPoll(image,title, description, 0, starts),
                     'Start date is required'
                    )
            })

            it('should confirm poll update failure', async () => {
                await expectRevert(
                    contract.updatePoll(100,image, 'new title', description, starts, starts),
                     'Poll does not exist'
                    )
            })

            it('should confirm poll deletion failure', async () => {
                await expectRevert(
                    contract.deletePoll(100),
                     'Poll does not exist'
                    )
            })

            
        })

    })

    describe('poll contest', () => {
        beforeEach(async () => {
            await contract.createPoll(image, title, description, starts, ends)
        })

        describe('Successes', () => {
            it('should confirm contestant entry success', async () => {
                result = await contract.getPoll(pollId)
                expect(result.contestants.toNumber()).to.be.equal(0)

                await contract.connect(contestant1).contest(pollId, name1, avatar1)
                await contract.connect(contestant2).contest(pollId, name2, avatar2)

                result = await contract.getPoll(pollId)
                expect(result.contestants.toNumber()).to.be.equal(2)

                result = await contract.getContestants(pollId)
                expect(result).to.have.lengthOf(2)

            })
        })

        describe('Failures', () => {
            it('should confirm contestant entry failure', async () => {
                await expectRevert(
                    contract.connect(contestant1).contest(100, name1, avatar1),
                     'Poll does not exist'
                    )
                await expectRevert(
                    contract.connect(contestant1).contest(pollId, '', avatar1),
                     'Name is required'
                    )

                await contract.connect(contestant1).contest(pollId, name1, avatar1)
                await expectRevert(
                    contract.connect(contestant1).contest(pollId, name1, avatar1),
                     'You have already contested in this poll'
                    )
            })
        })
    })

    describe('poll voting', () => {
        beforeEach(async () => {
            await contract.createPoll(image, title, description, starts, ends)
            await contract.connect(contestant1).contest(pollId, name1, avatar1)
            await contract.connect(contestant2).contest(pollId, name2, avatar2)
        })

        describe('Successes', () => {
            it('should confirm contest entry success', async () => {
                result = await contract.getPoll(pollId)
                expect(result.votes.toNumber()).to.be.equal(0)

                await contract.connect(contestant1).vote(pollId, contestantId)
                await contract.connect(contestant2).vote(pollId, contestantId)

                result = await contract.getPoll(pollId)
                expect(result.votes.toNumber()).to.be.equal(2)
                expect(result.voters).to.have.lengthOf(2)
                expect(result.avatars).to.have.lengthOf(2)

                result = await contract.getContestants(pollId)
                expect(result).to.have.lengthOf(2)

                result = await contract.getContestant(pollId, contestantId)
                expect(result.voters).to.have.lengthOf(2)
                expect(result.voter).to.be.equal(contestant1.address)
            })
        })

        describe('Failures', () => {
            it('should confirm contest entry failure', async () => {
                await expectRevert(
                    contract.vote(100, contestantId),
                     'Poll does not exist'
                    )
                
                await contract.deletePoll(pollId)
                await expectRevert(
                    contract.vote(pollId, contestantId),
                     'Poll has been deleted'
                    )
            })
        })
    })
})