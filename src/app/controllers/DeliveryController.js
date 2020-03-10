import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import File from '../models/File';
import DeliveryMan from '../models/DeliveryMan';
import Recipient from '../models/Recipient';
import CreateDeliveryMail from '../jobs/CreateDeliveryMail';
import CancelDeliveryMail from '../jobs/CancelDeliveryMail';
import Queue from '../../lib/Queue';

class DeliveryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos campos' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: 'ID do destinatário inválido' });
    }

    const deliveryman = await DeliveryMan.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'ID do entregador inválido' });
    }

    const delivery = await Delivery.create(req.body);

    await Queue.add(CreateDeliveryMail.key, {
      delivery,
      recipient,
      deliveryman,
    });

    return res.json({
      delivery,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      signature_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos campos' });
    }

    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res
        .status(400)
        .json({ error: 'Id da encomenda enviado é inválido' });
    }

    if (delivery.canceled_at) {
      return res.status(400).json({ error: 'Encomenda está cancelada' });
    }

    const deliveryRes = await delivery.update(req.body);

    return res.json({
      deliveryRes,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res
        .status(400)
        .json({ error: 'Id da encomenda enviado é inválido' });
    }

    if (delivery.end_date) {
      return res.status(400).json({ error: 'Encomenda já está encerrada' });
    }

    if (delivery.canceled_at) {
      return res.status(400).json({ error: 'Encomenda está cancelada' });
    }

    const deliveryman = await DeliveryMan.findByPk(delivery.deliveryman_id);

    delivery.canceled_at = new Date();

    await delivery.save();

    await Queue.add(CancelDeliveryMail.key, {
      delivery,
      deliveryman,
    });

    return res.json({
      message: 'Encomenda cancelada com sucesso',
    });
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const deliverys = await Delivery.findAll({
      where: {
        canceled_at: null,
      },
      delivery: [['created_at', 'DESC']],
      attributes: ['id', 'product', 'start_date', 'end_date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'name', 'path'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zipcode',
          ],
        },
        {
          model: DeliveryMan,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (deliverys.length < 1) {
      return res
        .status(400)
        .json({ error: 'Não foi encontrado nenhuma encomenda' });
    }

    return res.json({
      deliverys,
    });
  }
}

export default new DeliveryController();
